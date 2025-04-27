"""
#!/usr/bin/env python3
import http.server
import socketserver

PORT = 8000 # Make sure this matches the port in your shell script and frontend HTML

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*') # Allows requests from any origin
        self.send_header('Access-Control-Allow-Methods', 'GET') # Allows GET requests
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type') # Allows specific headers
        http.server.SimpleHTTPRequestHandler.end_headers(self)

with socketserver.TCPServer(("", PORT), CORSRequestHandler) as httpd:
    print(f"Serving HTTP with CORS on port {PORT}")
    httpd.serve_forever()
"""

#!/usr/bin/env python3

import http.server
import socketserver
import os  # Import os for changing directory

PORT = 8008  # Make sure this matches the port in your shell script and frontend HTML

# Set the directory to serve files from (where hls_stream is located)
# This makes sure the simple_server behavior serves from the correct place
# You might need to adjust this path if your script runs from elsewhere
WEB_ROOT = os.path.dirname(
    os.path.abspath(__file__)
)  # Assumes script is in the web root


class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers to ALL responses
        self.send_header(
            "Access-Control-Allow-Origin", "*"
        )  # Allows requests from any origin
        self.send_header("Access-Control-Allow-Methods", "GET")  # Allows GET requests
        self.send_header(
            "Access-Control-Allow-Headers", "X-Requested-With, Content-Type"
        )  # Allows specific headers
        # Call the parent class's end_headers LAST
        super().end_headers()

    def do_GET(self):
        # Handle the specific /test endpoint
        if self.path == "/test" or self.path == "/test/":
            self.send_response(200)  # OK status
            self.send_header("Content-type", "text/plain")  # Plain text response
            self.end_headers()  # Send headers (including CORS from end_headers)

            # Write the response body
            message = (
                "CORS-enabled server is running and the /test endpoint is working!\n"
            )
            self.wfile.write(message.encode("utf-8"))
            return  # Stop processing this request

        # For any other path, fall back to the default file serving behavior
        # This will serve files from the WEB_ROOT directory set below
        super().do_GET()


# Change the current directory to the web root so SimpleHTTPRequestHandler serves from there
os.chdir(WEB_ROOT)

# Set up the server
# The "" address means bind to all available network interfaces (0.0.0.0 and ::)
with socketserver.TCPServer(("", PORT), CORSRequestHandler) as httpd:
    print(f"Serving HTTP with CORS from '{WEB_ROOT}' on port {PORT}")
    # Correctly configure TCPServer to allow address reuse, preventing "Address already in use" errors
    # This is often needed when restarting servers quickly
    socketserver.TCPServer.allow_reuse_address = True
    httpd.serve_forever()
