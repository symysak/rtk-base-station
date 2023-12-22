import urllib.request
import subprocess
import os

debug =  os.environ.get("DEBUG", False)

if os.environ.get("BRANCH") == None:
    print("BRANCH is not set. Use default branch: main")
    branch = "main"
else:
    branch = os.environ.get("BRANCH")

url = "https://raw.githubusercontent.com/symysak/rtk-base-station/" + branch + "/docker-compose.yml"

req = urllib.request.Request(url)
with urllib.request.urlopen(req) as res:
   new_docker_compose = res.read().decode("utf-8")

with open("docker-compose.yml", "r") as f:
   old_docker_compose = f.read()

if new_docker_compose != old_docker_compose:
    with open("docker-compose.yml", "w") as f:
        f.write(new_docker_compose)
        f.close()
    if debug:
        print("docker-compose.yml updated")
    subprocess.run("docker-compose up -d", shell=True)