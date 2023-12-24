FROM ubuntu:latest as builder

WORKDIR /build

RUN apt update --fix-missing \
    && apt install -y git \
    build-essential \
    gfortran

RUN git clone -b rtklib_2.4.3 https://github.com/tomojitakasu/RTKLIB.git \
    && cd RTKLIB/lib/iers/gcc \
    && make \
    && cd ../../../app/consapp \
    && make

FROM ubuntu:latest

WORKDIR /app

COPY --from=builder /build/RTKLIB/app/consapp/str2str/gcc/str2str .

RUN apt update --fix-missing \
    && apt clean

EXPOSE 2101

CMD ["sh", "-c", "/app/str2str -in tcpcli://localhost:2102#rtcm3 -out ${out_stream}/${mountpoint}:${mountpoint}\;rtcm3.3\;${ntrip_msg}\;${carrer}\;GPS+GLO+GAL+BDS+QZS\;Raspberry Pi\;${country}\;${short_lat}\;${short_lon}\;0\;0\;github.com/symysak/rtk-base-station\;NONE\;${auth}\;N\;\;#rtcm3 -p ${lat} ${lon} ${hgt} -msg ${ntrip_msg}"]