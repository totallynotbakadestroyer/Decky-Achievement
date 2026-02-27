import ctypes, os, time, logging, sys, multiprocessing, decky
from multiprocessing import Process, Queue

class SteamUserStatsPtr(ctypes.c_void_p):
    pass

class Plugin:
    def __init__(self):
        self._lib_path = os.path.join(decky.DECKY_PLUGIN_DIR, "libsteam_api.so")

    def _get_steam_api(self, dll):
        SteamErrMsg = ctypes.c_char * 1024
        dll.SteamAPI_InitFlat.argtypes = [ctypes.POINTER(SteamErrMsg)]
        dll.SteamAPI_InitFlat.restype = ctypes.c_int
        dll.SteamAPI_Shutdown.restype = None
        dll.SteamAPI_RunCallbacks.restype = None
        dll.SteamAPI_SteamUserStats_v012.argtypes = []
        dll.SteamAPI_SteamUserStats_v012.restype = SteamUserStatsPtr

        methods = {
            "SteamAPI_ISteamUserStats_RequestCurrentStats": ([SteamUserStatsPtr], ctypes.c_bool),
            "SteamAPI_ISteamUserStats_GetNumAchievements": ([SteamUserStatsPtr], ctypes.c_uint32),
            "SteamAPI_ISteamUserStats_GetAchievementName": ([SteamUserStatsPtr, ctypes.c_uint32], ctypes.c_char_p),
            "SteamAPI_ISteamUserStats_GetAchievement": ([SteamUserStatsPtr, ctypes.c_char_p, ctypes.POINTER(ctypes.c_bool)], ctypes.c_bool),
            "SteamAPI_ISteamUserStats_GetAchievementDisplayAttribute": ([SteamUserStatsPtr, ctypes.c_char_p, ctypes.c_char_p], ctypes.c_char_p),
            "SteamAPI_ISteamUserStats_SetAchievement": ([SteamUserStatsPtr, ctypes.c_char_p], ctypes.c_bool),
            "SteamAPI_ISteamUserStats_ClearAchievement": ([SteamUserStatsPtr, ctypes.c_char_p], ctypes.c_bool),
            "SteamAPI_ISteamUserStats_StoreStats": ([SteamUserStatsPtr], ctypes.c_bool),
        }

        for name, (args, res) in methods.items():
            func = getattr(dll, name)
            func.argtypes, func.restype = args, res

    def _execute_steam_task(self, q, appid, action, api_name=None):
        try:
            os.environ["SteamAppId"] = str(appid)
            os.environ["SteamGameId"] = str(appid)
            dll = ctypes.CDLL(self._lib_path)
            self._get_steam_api(dll)

            SteamErrMsg = ctypes.c_char * 1024
            err_msg = SteamErrMsg()
            init_result = dll.SteamAPI_InitFlat(ctypes.byref(err_msg))
            if init_result != 0:
                decky.logger.error(f"SteamAPI_InitFlat failed ({init_result}): {err_msg.value.decode('utf-8', errors='replace')}")
                q.put(None)
                return

            user_stats = dll.SteamAPI_SteamUserStats_v012()
            dll.SteamAPI_ISteamUserStats_RequestCurrentStats(user_stats)
            
            # symc with steam cause its async
            for _ in range(10):
                dll.SteamAPI_RunCallbacks()
                time.sleep(0.1)

            result = None
            # achievemnt fetching logic
            if action == "get":
                num = dll.SteamAPI_ISteamUserStats_GetNumAchievements(user_stats)
                result = []
                for i in range(num):
                    raw_api = dll.SteamAPI_ISteamUserStats_GetAchievementName(user_stats, i)
                    if not raw_api: continue
                    
                    achieved = ctypes.c_bool(False)
                    dll.SteamAPI_ISteamUserStats_GetAchievement(user_stats, raw_api, ctypes.byref(achieved))
                    name = dll.SteamAPI_ISteamUserStats_GetAchievementDisplayAttribute(user_stats, raw_api, b"name")
                    desc = dll.SteamAPI_ISteamUserStats_GetAchievementDisplayAttribute(user_stats, raw_api, b"desc")

                    result.append({
                        "api_name": raw_api.decode("utf-8"),
                        "name": name.decode("utf-8") if name else raw_api.decode("utf-8"),
                        "unlocked": bool(achieved.value),
                        "desc": desc.decode("utf-8") if desc else ""
                    })
            
            # achievement setting logic
            elif action in ("set", "clear"):
                func = dll.SteamAPI_ISteamUserStats_SetAchievement if action == "set" else dll.SteamAPI_ISteamUserStats_ClearAchievement
                if func(user_stats, api_name.encode("utf-8")):
                    result = bool(dll.SteamAPI_ISteamUserStats_StoreStats(user_stats))
                    dll.SteamAPI_RunCallbacks()

            dll.SteamAPI_Shutdown()
            q.put(result)
        except Exception as e:
            decky.logger.error(f"Task error: {e} for appid {appid} and action {action}")
            q.put(None)

    def _run_in_process(self, appid: int, action: str, api_name: str = None):
        decky.logger.info(f"Running in process: {appid} {action} {api_name}")
        queue = Queue()
        p = Process(target=self._execute_steam_task, args=(queue, appid, action, api_name))
        p.start()
        res = queue.get()
        p.join()
        return res or []

    async def get_achievements(self, appid: int):
        return self._run_in_process(appid, "get")

    async def toggle_achievement(self, appid: int, api_name: str, unlock: bool):
        action = "set" if unlock else "clear"
        return self._run_in_process(appid, action, api_name)

    async def _main(self):
        decky.logger.info("Decky-Achievement Initialized")

    async def _unload(self):
        decky.logger.info("Decky-Achievement Unloaded")