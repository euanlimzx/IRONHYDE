import subprocess
import os
import signal
import time
import shutil  # For removing stream directory

# --- Global State ---
xvfb_process = None
ffmpeg_process = None
display_num = 99  # Must match Xvfb and FFmpeg :display
default_stream_dir = "./hls_stream_py"


def start_xvfb(width=1920, height=1080, depth=24):
    """Starts the Xvfb process if not already running."""
    global xvfb_process
    if xvfb_process and xvfb_process.poll() is None:
        print(
            f"Xvfb already running with PID {xvfb_process.pid} on display :{display_num}"
        )
        # Ensure DISPLAY is set if we think it's running
        os.environ["DISPLAY"] = f":{display_num}"
        return True, f"Xvfb already running (PID: {xvfb_process.pid})"

    display = f":{display_num}"
    screen = f"{width}x{height}x{depth}"
    xvfb_cmd = [
        "Xvfb",
        display,
        "-screen",
        "0",
        screen,
        "-ac",
        "-noreset",
        "-nolisten",
        "tcp",
    ]

    try:
        print(f"Starting Xvfb on display {display} with screen {screen}...")
        xvfb_process = subprocess.Popen(
            xvfb_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )
        time.sleep(2)  # Give Xvfb time to initialize

        if xvfb_process.poll() is None:
            os.environ["DISPLAY"] = display
            print(
                f"Xvfb started successfully with PID {xvfb_process.pid} on display {display}"
            )
            return True, f"Xvfb started (PID: {xvfb_process.pid})"
        else:
            print(f"Xvfb failed to start. Exit code: {xvfb_process.returncode}")
            xvfb_process = None
            return False, "Xvfb failed to start"
    except FileNotFoundError:
        print("Error: Xvfb command not found. Make sure it's installed.")
        xvfb_process = None
        return False, "Xvfb command not found"
    except Exception as e:
        print(f"An error occurred while starting Xvfb: {e}")
        xvfb_process = None
        return False, f"Error starting Xvfb: {e}"


def stop_xvfb():
    """Stops the Xvfb process if it's running."""
    global xvfb_process
    if xvfb_process and xvfb_process.poll() is None:
        pid = xvfb_process.pid
        print(f"Stopping Xvfb (PID: {pid})...")
        try:
            xvfb_process.terminate()
            try:
                xvfb_process.wait(timeout=5)
                print(f"Xvfb (PID: {pid}) terminated gracefully.")
            except subprocess.TimeoutExpired:
                print(
                    f"Xvfb (PID: {pid}) did not terminate gracefully, sending SIGKILL..."
                )
                xvfb_process.kill()
                xvfb_process.wait()
                print(f"Xvfb (PID: {pid}) killed.")

            if os.environ.get("DISPLAY") == f":{display_num}":
                del os.environ["DISPLAY"]
                print(f"Unset DISPLAY environment variable (:{display_num})")

            xvfb_process = None
            return True, f"Xvfb stopped (PID: {pid})"
        except Exception as e:
            print(f"An error occurred while stopping Xvfb (PID: {pid}): {e}")
            xvfb_process = None
            return False, f"Error stopping Xvfb: {e}"
    else:
        print("Xvfb is not running or process object not found.")
        if os.environ.get("DISPLAY") == f":{display_num}":
            del os.environ["DISPLAY"]
        xvfb_process = None
        return True, "Xvfb was not running"


# --- FFmpeg Recording Management ---
def start_ffmpeg_recording(
    stream_dir=default_stream_dir, width=1920, height=1080, framerate=25
):
    """Starts the FFmpeg recording process if not already running."""
    global ffmpeg_process

    # Prerequisite check: Xvfb must be running (check DISPLAY)
    display = os.environ.get("DISPLAY")
    if not display or display != f":{display_num}":
        msg = f"Cannot start FFmpeg: Xvfb not running or DISPLAY (currently '{display}') is not set to ':{display_num}'."
        print(msg)
        return False, msg

    if ffmpeg_process and ffmpeg_process.poll() is None:
        print(f"FFmpeg already running with PID {ffmpeg_process.pid}")
        return True, f"FFmpeg already running (PID: {ffmpeg_process.pid})"

    # Ensure stream directory exists
    try:
        os.makedirs(stream_dir, exist_ok=True)
        print(f"Ensured HLS stream directory exists: {stream_dir}")
    except OSError as e:
        msg = f"Failed to create stream directory {stream_dir}: {e}"
        print(msg)
        return False, msg

    # Construct FFmpeg command (carefully split into a list)
    ffmpeg_cmd = [
        "ffmpeg",
        "-f",
        "x11grab",
        "-video_size",
        f"{width}x{height}",
        "-framerate",
        str(framerate),
        "-i",
        display,  # Use the DISPLAY variable from environment
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "23",
        "-pix_fmt",
        "yuv420p",
        "-g",
        "50",  # Keyframe interval
        "-hls_time",
        "2",  # Segment duration
        "-hls_list_size",
        "5",  # Max segments in playlist
        "-hls_flags",
        "delete_segments+append_list",
        os.path.join(stream_dir, "stream.m3u8"),  # Output playlist
    ]

    try:
        print(f"Starting FFmpeg recording to {stream_dir}...")
        print(f"Command: {' '.join(ffmpeg_cmd)}")  # For debugging
        # Start FFmpeg, redirect stdout/stderr
        # Capture stderr to check for immediate errors
        ffmpeg_process = subprocess.Popen(
            ffmpeg_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE
        )
        time.sleep(2)  # Give FFmpeg time to start and potentially error out

        if ffmpeg_process.poll() is None:
            print(f"FFmpeg started successfully with PID {ffmpeg_process.pid}")
            # Optional: Check stderr for warnings after startup?
            # err = ffmpeg_process.stderr.read() # Non-blocking read might be better
            return True, f"FFmpeg started (PID: {ffmpeg_process.pid})"
        else:
            # FFmpeg exited immediately, likely an error
            error_output = ffmpeg_process.stderr.read().decode(errors="ignore")
            msg = f"FFmpeg failed to start. Exit code: {ffmpeg_process.returncode}. Error: {error_output}"
            print(msg)
            ffmpeg_process = None
            return False, msg
    except FileNotFoundError:
        print("Error: ffmpeg command not found. Make sure it's installed and in PATH.")
        ffmpeg_process = None
        return False, "ffmpeg command not found"
    except Exception as e:
        print(f"An error occurred while starting FFmpeg: {e}")
        ffmpeg_process = None
        return False, f"Error starting FFmpeg: {e}"


def stop_ffmpeg_recording(cleanup_dir=False, stream_dir=default_stream_dir):
    """Stops the FFmpeg process if it's running."""
    global ffmpeg_process
    if ffmpeg_process and ffmpeg_process.poll() is None:
        pid = ffmpeg_process.pid
        print(f"Stopping FFmpeg (PID: {pid})...")
        try:
            # FFmpeg often responds well to SIGINT (Ctrl+C) for graceful shutdown
            # or SIGTERM (terminate). Let's try terminate first.
            ffmpeg_process.terminate()  # Sends SIGTERM
            try:
                ffmpeg_process.wait(timeout=10)  # Wait longer for FFmpeg finalization
                print(f"FFmpeg (PID: {pid}) terminated gracefully.")
            except subprocess.TimeoutExpired:
                print(
                    f"FFmpeg (PID: {pid}) did not terminate gracefully, sending SIGKILL..."
                )
                ffmpeg_process.kill()  # Sends SIGKILL
                ffmpeg_process.wait()
                print(f"FFmpeg (PID: {pid}) killed.")

            # Optional: Clean up the stream directory
            if cleanup_dir:
                try:
                    shutil.rmtree(stream_dir)
                    print(f"Cleaned up stream directory: {stream_dir}")
                except OSError as e:
                    print(
                        f"Warning: Failed to remove stream directory {stream_dir}: {e}"
                    )

            ffmpeg_process = None
            return True, f"FFmpeg stopped (PID: {pid})"
        except Exception as e:
            print(f"An error occurred while stopping FFmpeg (PID: {pid}): {e}")
            ffmpeg_process = None
            # Still attempt cleanup if requested
            if cleanup_dir:
                try:
                    shutil.rmtree(stream_dir)
                    print(f"Cleaned up stream directory after error: {stream_dir}")
                except OSError as e:
                    print(
                        f"Warning: Failed to remove stream directory {stream_dir} after error: {e}"
                    )
            return False, f"Error stopping FFmpeg: {e}"
    else:
        print("FFmpeg is not running or process object not found.")
        ffmpeg_process = None  # Ensure state is clean
        # Optional cleanup even if process wasn't found?
        if cleanup_dir:
            try:
                if os.path.exists(stream_dir):
                    shutil.rmtree(stream_dir)
                    print(
                        f"Cleaned up potentially orphaned stream directory: {stream_dir}"
                    )
            except OSError as e:
                print(
                    f"Warning: Failed to remove potentially orphaned stream directory {stream_dir}: {e}"
                )
        return True, "FFmpeg was not running"


def clean_ffmpeg_stream():
    """
    Deletes the folder where the stream was stored
    """
    os.removedirs(default_stream_dir)
