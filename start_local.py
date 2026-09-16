#!/usr/bin/env python3
"""Serve the prototype locally without third-party dependencies."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import threading
import webbrowser


class LocalHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        '.js': 'text/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.html': 'text/html; charset=utf-8',
    }

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


def main():
    parser = argparse.ArgumentParser(description='ENCY Localizer local server')
    parser.add_argument('--port', type=int, default=8080)
    parser.add_argument('--no-browser', action='store_true')
    args = parser.parse_args()
    root = Path(__file__).resolve().parent / 'dist'
    if not (root / 'index.html').is_file():
        parser.exit(1, 'Missing dist/index.html. Extract the complete ZIP first.\n')
    if not 1 <= args.port <= 65535:
        parser.exit(1, 'Port must be between 1 and 65535.\n')
    try:
        server = ThreadingHTTPServer(('127.0.0.1', args.port), partial(LocalHandler, directory=str(root)))
    except OSError as exc:
        parser.exit(1, f'Cannot start local server: {exc}\nTry another port: --port 8081\n')
    url = f'http://127.0.0.1:{args.port}'
    print(f'ENCY Localizer\nOpen: {url}\nStop: Ctrl+C\n', flush=True)
    if not args.no_browser:
        timer = threading.Timer(0.4, webbrowser.open, args=(url,))
        timer.daemon = True
        timer.start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nServer stopped.')
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
