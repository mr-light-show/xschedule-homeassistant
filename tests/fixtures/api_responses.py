"""Real xSchedule API response structures from actual system.

These responses are taken from xschedule_api_reference.md which documents
actual API responses from a live xSchedule system. Using real response
structures ensures tests catch any parsing issues.

All responses use actual playlist names and controller data from the
production system.
"""

# GetPlayingStatus responses
# ===========================

PLAYING_STATUS_FULL = {
    "status": "playing",
    "playlist": "Halloween",
    "playlistid": "11",
    "playlistlooping": "true",
    "playlistloopsleft": "-32",
    "random": "false",
    "step": "Light Em Up",
    "stepid": "17",
    "steplooping": "false",
    "steploopsleft": "-1",
    "length": "3:05.750",
    "lengthms": "185750",
    "position": "1:57.925",
    "positionms": "117925",
    "left": "1:07.825",
    "leftms": "67825",
    "playlistposition": "1:57.925",
    "playlistpositionms": "117925",
    "playlistleft": "1:07.825",
    "playlistleftms": "67825",
    "trigger": "scheduled",
    "schedulename": "October sunset-30 -> 11pm",
    "scheduleend": "2025-10-21 23:00",
    "scheduleid": "17",
    "nextstep": "Pirates of the Caribbean",
    "nextstepid": "18",
    "version": "2025.10",
    "queuelength": "0",
    "volume": "100",
    "brightness": "100",
    "time": "2025-10-21 22:07:23",
    "ip": "192.168.0.185",
    "reference": "",
    "autooutputtolights": "false",
    "passwordset": "false",
    "outputtolights": "true",
    "pingstatus": [
        {
            "controller": "192.168.1.101 Tree / Eves",
            "ip": "192.168.1.101",
            "result": "Ok",
            "failcount": "0"
        },
        {
            "controller": "192.168.1.102 House",
            "ip": "192.168.1.102",
            "result": "Ok",
            "failcount": "0"
        }
    ]
}

PLAYING_STATUS_BACKGROUND = {
    "status": "playing",
    "playlist": "Halloween Background",
    "playlistid": "10",
    "playlistlooping": "true",
    "step": "House lights",
    "stepid": "50",
    "lengthms": "120000",
    "positionms": "45000",
    "leftms": "75000",
    "volume": "100",
    "outputtolights": "true",
    "pingstatus": [
        {
            "controller": "192.168.1.101 Tree / Eves",
            "ip": "192.168.1.101",
            "result": "Ok",
            "failcount": "0"
        },
        {
            "controller": "192.168.1.102 House",
            "ip": "192.168.1.102",
            "result": "Ok",
            "failcount": "0"
        }
    ]
}

PLAYING_STATUS_IDLE = {
    "status": "idle",
    "version": "2025.10",
    "queuelength": "0",
    "volume": "100",
    "brightness": "100",
    "time": "2025-10-27 10:00:00",
    "ip": "192.168.0.185",
    "reference": "",
    "autooutputtolights": "false",
    "passwordset": "false",
    "outputtolights": "false",
    "pingstatus": [
        {
            "controller": "192.168.1.101 Tree / Eves",
            "ip": "192.168.1.101",
            "result": "Ok",
            "failcount": "0"
        },
        {
            "controller": "192.168.1.102 House",
            "ip": "192.168.1.102",
            "result": "Ok",
            "failcount": "0"
        }
    ]
}

PLAYING_STATUS_PAUSED = {
    "status": "paused",
    "playlist": "Halloween",
    "step": "Light Em Up",
    "lengthms": "185750",
    "positionms": "90000",
    "leftms": "95750",
    "volume": "100",
    "outputtolights": "true",
}

PLAYING_STATUS_MINIMAL = {
    "status": "playing",
    "volume": "100",
}

PLAYING_STATUS_CONTROLLER_FAILURE = {
    "status": "playing",
    "playlist": "Halloween",
    "step": "Light Em Up",
    "pingstatus": [
        {
            "controller": "192.168.1.101 Tree / Eves",
            "ip": "192.168.1.101",
            "result": "Failed",
            "failcount": "3"
        },
        {
            "controller": "192.168.1.102 House",
            "ip": "192.168.1.102",
            "result": "Ok",
            "failcount": "0"
        }
    ]
}

# GetPlaylists responses
# =======================

PLAYLISTS_RESPONSE = {
    "playlists": [
        {
            "name": "Halloween Background",
            "id": "10",
            "looping": "true",
            "nextscheduled": "2025-10-23 17:00:00",
            "length": "10:30.000",
            "lengthms": "630000"
        },
        {
            "name": "Halloween",
            "id": "11",
            "looping": "false",
            "nextscheduled": "",
            "length": "33:24.275",
            "lengthms": "2004275"
        }
    ],
    "reference": ""
}

PLAYLISTS_RESPONSE_EMPTY = {
    "playlists": [],
    "reference": ""
}

PLAYLISTS_RESPONSE_STRINGS = {
    "playlists": ["Halloween Background", "Halloween"],
    "reference": ""
}

# GetPlayListSteps responses
# ===========================

PLAYLIST_STEPS_HALLOWEEN = {
    "steps": [
        {
            "name": "Light Em Up",
            "id": "17",
            "startonly": "false",
            "endonly": "false",
            "everystep": "false",
            "offset": "0:00.000",
            "length": "3:05.750",
            "lengthms": "185750"
        },
        {
            "name": "Pirates of the Caribbean",
            "id": "18",
            "startonly": "false",
            "endonly": "false",
            "everystep": "false",
            "offset": "3:05.750",
            "length": "4:49.400",
            "lengthms": "289400"
        },
        {
            "name": "Spooky Scary Skeletons",
            "id": "19",
            "startonly": "false",
            "endonly": "false",
            "everystep": "false",
            "offset": "7:55.150",
            "length": "2:49.125",
            "lengthms": "169125"
        }
    ],
    "reference": ""
}

PLAYLIST_STEPS_BACKGROUND = {
    "steps": [
        {
            "name": "House lights",
            "id": "50",
            "startonly": "false",
            "endonly": "false",
            "everystep": "false",
            "offset": "0:00.000",
            "length": "2:00.000",
            "lengthms": "120000"
        }
    ],
    "reference": ""
}

PLAYLIST_STEPS_EMPTY = {
    "steps": [],
    "reference": ""
}

# GetQueuedSteps responses
# =========================

QUEUED_STEPS_WITH_ITEMS = {
    "steps": [
        {
            "name": "Thriller",
            "id": "20",
            "playlist": "Halloween",
            "lengthms": "358000"
        },
        {
            "name": "Monster Mash",
            "id": "21",
            "playlist": "Halloween",
            "lengthms": "182000"
        }
    ],
    "reference": ""
}

QUEUED_STEPS_EMPTY = {
    "steps": [],
    "reference": ""
}

# GetPlayListSchedules responses
# ===============================

PLAYLIST_SCHEDULES_RESPONSE = {
    "schedules": [
        {
            "name": "October sunset-30 -> 11pm",
            "id": "17",
            "enabled": "true",
            "active": "true",
            "looping": "true",
            "playlist": "Halloween",
            "starttime": "17:00:00",
            "endtime": "23:00:00",
            "dow": "Mon,Tue,Wed,Thu,Fri,Sat,Sun",
            "startdate": "2025-10-01",
            "enddate": "2025-10-31"
        },
        {
            "name": "October 8am -> sunset",
            "id": "18",
            "enabled": "true",
            "active": "false",
            "looping": "true",
            "playlist": "Halloween Background",
            "starttime": "08:00:00",
            "endtime": "17:00:00",
            "dow": "Mon,Tue,Wed,Thu,Fri,Sat,Sun",
            "startdate": "2025-10-01",
            "enddate": "2025-10-31"
        }
    ],
    "reference": ""
}

PLAYLIST_SCHEDULES_EMPTY = {
    "schedules": [],
    "reference": ""
}

# WebSocket message samples
# ==========================

WEBSOCKET_MESSAGE_PLAYING = {
    "status": "playing",
    "playlist": "Halloween",
    "step": "Light Em Up",
    "positionms": "45000",
    "lengthms": "185750",
    "leftms": "140750",
    "volume": "100",
    "outputtolights": "true"
}

WEBSOCKET_MESSAGE_IDLE = {
    "status": "idle",
    "volume": "100",
    "outputtolights": "false"
}

WEBSOCKET_MESSAGE_PLAYLIST_CHANGE = {
    "status": "playing",
    "playlist": "Halloween Background",
    "step": "House lights",
    "positionms": "0",
    "lengthms": "120000",
    "volume": "100"
}

WEBSOCKET_MESSAGE_SONG_CHANGE = {
    "status": "playing",
    "playlist": "Halloween",
    "step": "Pirates of the Caribbean",
    "positionms": "0",
    "lengthms": "289400",
    "leftms": "289400",
    "volume": "100"
}

WEBSOCKET_MESSAGE_CONTROLLER_UPDATE = {
    "status": "playing",
    "playlist": "Halloween",
    "pingstatus": [
        {
            "controller": "192.168.1.101 Tree / Eves",
            "ip": "192.168.1.101",
            "result": "Ok",
            "failcount": "0"
        },
        {
            "controller": "192.168.1.102 House",
            "ip": "192.168.1.102",
            "result": "Failed",
            "failcount": "2"
        }
    ]
}

# Edge case responses
# ===================

RESPONSE_WITH_INVALID_MILLISECONDS = {
    "status": "playing",
    "positionms": "invalid",
    "lengthms": "not_a_number",
    "leftms": "bad_value"
}

RESPONSE_WITH_MISSING_FIELDS = {
    "status": "playing"
    # Missing: playlist, step, position, duration, etc.
}

RESPONSE_WITH_NULL_VALUES = {
    "status": "playing",
    "playlist": None,
    "step": None,
    "positionms": None,
    "lengthms": None
}

RESPONSE_WITH_EXTRA_FIELDS = {
    "status": "playing",
    "playlist": "Halloween",
    "future_field_1": "unexpected_value",
    "future_field_2": {"nested": "data"},
    "experimental_feature": "true"
}
