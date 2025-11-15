import os
import socket
import paramiko

# Expose this directory
ROOT_DIR = "/tmp/sftp_share"

# Username for connecting
USERNAME = "testuser"

# Host key (server identity). Generate with: ssh-keygen -f server_rsa_key
HOST_KEY = paramiko.RSAKey(filename="server_rsa_key")

class NoAuthServer(paramiko.ServerInterface):
    def check_auth_password(self, username, password):
        if username == USERNAME:
            return paramiko.AUTH_SUCCESSFUL
        return paramiko.AUTH_FAILED

    def check_auth_publickey(self, username, key):
        # Also allow key auth if you want
        if username == USERNAME:
            return paramiko.AUTH_SUCCESSFUL
        return paramiko.AUTH_FAILED

    def get_allowed_auths(self, username):
        return "password,publickey"

def start_sftp_server():
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.bind(("0.0.0.0", 2222))  # Listen on port 2222
    sock.listen(100)
    print("SFTP server listening on port 2222...")

    while True:
        client, addr = sock.accept()
        print(f"Connection from {addr}")

        transport = paramiko.Transport(client)
        transport.add_server_key(HOST_KEY)

        server = NoAuthServer()
        transport.start_server(server=server)

        chan = transport.accept(20)
        if chan is None:
            print("No channel")
            continue

        sftp_server = paramiko.SFTPServer(transport, ROOT_DIR)
        print(f"SFTP session started for {USERNAME}")

if __name__ == "__main__":
    os.makedirs(ROOT_DIR, exist_ok=True)
    start_sftp_server()

