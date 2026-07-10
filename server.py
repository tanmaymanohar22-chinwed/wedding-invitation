import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(ROOT, 'data')
DATA_FILE = os.path.join(DATA_DIR, 'rsvp-submissions.json')


class RSVPHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/rsvp':
            self.send_json_response({'status': 'ok'})
            return
        self.serve_static()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == '/api/rsvp':
            self.handle_rsvp_submission()
            return
        self.send_response(404)
        self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def handle_rsvp_submission(self):
        content_length = int(self.headers.get('Content-Length', '0'))
        raw_body = self.rfile.read(content_length) if content_length else b'{}'

        try:
            payload = json.loads(raw_body.decode('utf-8'))
        except json.JSONDecodeError:
            payload = {}

        os.makedirs(DATA_DIR, exist_ok=True)
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, 'r', encoding='utf-8') as fh:
                try:
                    submissions = json.load(fh)
                except json.JSONDecodeError:
                    submissions = []
        else:
            submissions = []

        submissions.append({
            **payload,
            'submittedAt': payload.get('submittedAt') or self._timestamp(),
        })

        with open(DATA_FILE, 'w', encoding='utf-8') as fh:
            json.dump(submissions, fh, indent=2)

        self.send_json_response({'ok': True, 'saved': True})

    def serve_static(self):
        path = self.path.split('?', 1)[0]
        if path in ('', '/'):
            file_path = os.path.join(ROOT, 'index.html')
        else:
            file_path = os.path.join(ROOT, path.lstrip('/'))

        if os.path.isdir(file_path):
            file_path = os.path.join(file_path, 'index.html')

        if os.path.exists(file_path) and os.path.isfile(file_path):
            self.send_response(200)
            self.send_header('Content-Type', self._content_type(file_path))
            self.end_headers()
            with open(file_path, 'rb') as fh:
                self.wfile.write(fh.read())
        else:
            self.send_response(404)
            self.end_headers()

    def send_json_response(self, payload):
        body = json.dumps(payload).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)

    def _content_type(self, file_path):
        if file_path.endswith('.html'):
            return 'text/html; charset=utf-8'
        if file_path.endswith('.css'):
            return 'text/css; charset=utf-8'
        if file_path.endswith('.js'):
            return 'application/javascript; charset=utf-8'
        if file_path.endswith('.json'):
            return 'application/json; charset=utf-8'
        if file_path.endswith('.png'):
            return 'image/png'
        if file_path.endswith('.jpg') or file_path.endswith('.jpeg'):
            return 'image/jpeg'
        return 'application/octet-stream'

    def _timestamp(self):
        from datetime import datetime
        return datetime.utcnow().isoformat() + 'Z'


def run(server_class=ThreadingHTTPServer, handler_class=RSVPHandler, port=8000):
    server_address = ('0.0.0.0', port)
    httpd = server_class(server_address, handler_class)
    print(f'Serving on http://127.0.0.1:{port}')
    httpd.serve_forever()


if __name__ == '__main__':
    run()
