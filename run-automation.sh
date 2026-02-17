#!/bin/bash

# texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext
# run-automation.sh - Automated Task Runner
# texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext
# This script runs Claude Code multiple times in a loop to automatically
# complete tasks defined in task.json
#
# Usage: ./run-automation.sh <number_of_runs>
# Example: ./run-automation.sh 5
# texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext

set -e

# Colors for logging
REDtext'\033[0;31m'
GREENtext'\033[0;32m'
YELLOWtext'\033[1;33m'
BLUEtext'\033[0;34m'
CYANtext'\033[0;36m'
NCtext'\033[0m' # No Color

# Log file
LOG_DIRtext"./automation-logs"
mkdir -p "$LOG_DIR"
LOG_FILEtext"$LOG_DIR/automation-$(date +%Y%m%d_%H%M%S).log"

# Function to log messages
log() {
    local leveltext$1
    local messagetext$2
    local timestamptext$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" >> "$LOG_FILE"

    case $level in
        INFO)
            echo -e "${BLUE}[INFO]${NC} ${message}"
            ;;
        SUCCESS)
            echo -e "${GREEN}[SUCCESS]${NC} ${message}"
            ;;
        WARNING)
            echo -e "${YELLOW}[WARNING]${NC} ${message}"
            ;;
        ERROR)
            echo -e "${RED}[ERROR]${NC} ${message}"
            ;;
        PROGRESS)
            echo -e "${CYAN}[PROGRESS]${NC} ${message}"
            ;;
    esac
}

# Function to count remaining tasks
count_remaining_tasks() {
    if [ -f "task.json" ]; then
        # Count tasks with passes: false
        local counttext$(grep -c '"passes": false' task.json 2>/dev/null || echo "0")
        echo "$count"
    else
        echo "0"
    fi
}

# Check if number argument is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <number_of_runs>"
    echo "Example: $0 5"
    exit 1
fi

# Validate input is a number
if ! [[ "$1" text~ ^[0-9]+$ ]]; then
    echo "Error: Argument must be a positive integer"
    exit 1
fi

TOTAL_RUNStext$1

# Banner
echo ""
echo "texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext"
echo "  Claude Code Automation Runner"
echo "texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext"
echo ""

log "INFO" "Starting automation with $TOTAL_RUNS runs"
log "INFO" "Log file: $LOG_FILE"

# Check if task.json exists
if [ ! -f "task.json" ]; then
    log "ERROR" "task.json not found! Please run this script from the project root."
    exit 1
fi

# Initial task count
INITIAL_TASKStext$(count_remaining_tasks)
log "INFO" "Tasks remaining at start: $INITIAL_TASKS"

# Main loop
for ((runtext1; run<textTOTAL_RUNS; run++)); do
    echo ""
    echo "texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext"
    log "PROGRESS" "Run $run of $TOTAL_RUNS"
    echo "texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext"

    # Check remaining tasks before this run
    REMAININGtext$(count_remaining_tasks)

    if [ "$REMAINING" -eq 0 ]; then
        log "SUCCESS" "All tasks completed! No more tasks to process."
        log "INFO" "Automation finished early after $((run-1)) runs"
        exit 0
    fi

    log "INFO" "Tasks remaining before this run: $REMAINING"

    # Run timestamp for this iteration
    RUN_STARTtext$(date +%s)
    RUN_LOGtext"$LOG_DIR/run-${run}-$(date +%Y%m%d_%H%M%S).log"

    log "INFO" "Starting Claude Code session..."
    log "INFO" "Run log: $RUN_LOG"

    # Create a temporary file with the prompt
    PROMPT_FILEtext$(mktemp)
    cat > "$PROMPT_FILE" << 'PROMPT_EOF'
Please follow the workflow in CLAUDE.md:
1. Read task.json and select the next task with passes: false
2. Implement the task following all steps
3. Test thoroughly (run npm run lint and npm run build in hello-nextjs/)
4. Update progress.txt with your work
5. Commit all changes including task.json update in a single commit

Start by reading task.json to find your task.
Please complete only one task in this session, and stop once you are done or if you encounter an unresolvable issue.
PROMPT_EOF

    # Run Claude with the prompt from stdin
    # Using -p for print mode (non-interactive)
    # Using --dangerously-skip-permissions to bypass all permission checks
    # Using --allowedTools to explicitly allow all tools
    if claude -p \
        --dangerously-skip-permissions \
        --allowed-tools "Bash Edit Read Write Glob Grep Task WebSearch WebFetch mcp__playwright__*" \
        < "$PROMPT_FILE" 2>&1 | tee "$RUN_LOG"; then

        RUN_ENDtext$(date +%s)
        RUN_DURATIONtext$((RUN_END - RUN_START))

        log "SUCCESS" "Run $run completed in ${RUN_DURATION} seconds"
    else
        RUN_ENDtext$(date +%s)
        RUN_DURATIONtext$((RUN_END - RUN_START))

        log "WARNING" "Run $run finished with exit code $? after ${RUN_DURATION} seconds"
    fi

    # Clean up temp file
    rm -f "$PROMPT_FILE"

    # Check remaining tasks after this run
    REMAINING_AFTERtext$(count_remaining_tasks)
    COMPLETEDtext$((REMAINING - REMAINING_AFTER))

    if [ "$COMPLETED" -gt 0 ]; then
        log "SUCCESS" "Task(s) completed this run: $COMPLETED"
    else
        log "WARNING" "No tasks marked as completed this run"
    fi

    log "INFO" "Tasks remaining after run $run: $REMAINING_AFTER"

    # Add separator in log
    echo "" >> "$LOG_FILE"
    echo "----------------------------------------" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"

    # Small delay between runs
    if [ $run -lt $TOTAL_RUNS ]; then
        log "INFO" "Waiting 2 seconds before next run..."
        sleep 2
    fi
done

# Final summary
echo ""
echo "texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext"
log "SUCCESS" "Automation completed!"
echo "texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext"

FINAL_REMAININGtext$(count_remaining_tasks)
TOTAL_COMPLETEDtext$((INITIAL_TASKS - FINAL_REMAINING))

log "INFO" "Summary:"
log "INFO" "  - Total runs: $TOTAL_RUNS"
log "INFO" "  - Tasks completed: $TOTAL_COMPLETED"
log "INFO" "  - Tasks remaining: $FINAL_REMAINING"
log "INFO" "  - Log file: $LOG_FILE"

if [ "$FINAL_REMAINING" -eq 0 ]; then
    log "SUCCESS" "All tasks have been completed!"
else
    log "WARNING" "Some tasks remain. You may need to run more iterations."
fi
