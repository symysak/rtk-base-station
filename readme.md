# RTK base station
```.
├── str2str         # RTKLIB str2str docker image
├── ntrip-caster    # ntrip caster docker image
├── sync-docker-compose # to sync docker-compose with github
└── README.md
```

## Installations
```
git clone https://github.com/symysak/rtk-base-station.git

# install sync-docker-compose
cd rtk-base-station/sync-docker-compose
cp sync-docker-compose /etc/cron.d/sync-docker-compose


```