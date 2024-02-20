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
COPY healthcheck.sh .
RUN chmod +x healthcheck.sh

RUN apt update --fix-missing \
    && apt clean \
    && apt install -y coreutils netcat

EXPOSE 2102

WORKDIR /config

ENTRYPOINT [ "/config/entrypoint.sh" ]