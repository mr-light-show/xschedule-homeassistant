"""Constants for the xSchedule integration."""

DOMAIN = "xschedule"

# Configuration keys
CONF_HOST = "host"
CONF_PORT = "port"
CONF_PASSWORD = "password"

# Default values
DEFAULT_PORT = 80
DEFAULT_NAME = "xSchedule"

# WebSocket
WS_RETRY_DELAY = 5  # seconds
WS_HEARTBEAT_INTERVAL = 30  # seconds

# Update intervals
UPDATE_INTERVAL = 1  # seconds (fallback if WebSocket unavailable)

# API endpoints
API_QUERY = "xScheduleQuery"
API_COMMAND = "xScheduleCommand"

# Events
EVENT_PLAY = f"{DOMAIN}_play"
EVENT_PAUSE = f"{DOMAIN}_pause"
EVENT_STOP = f"{DOMAIN}_stop"
EVENT_NEXT = f"{DOMAIN}_next"
EVENT_PREVIOUS = f"{DOMAIN}_previous"
EVENT_SEEK = f"{DOMAIN}_seek"
EVENT_PLAYLIST_CHANGED = f"{DOMAIN}_playlist_changed"
EVENT_VOLUME_SET = f"{DOMAIN}_volume_set"
EVENT_VOLUME_ADJUST = f"{DOMAIN}_volume_adjust"
EVENT_MUTE_TOGGLE = f"{DOMAIN}_mute_toggle"
EVENT_QUEUE_ADD = f"{DOMAIN}_queue_add"
EVENT_QUEUE_CLEAR = f"{DOMAIN}_queue_clear"
