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
COPY source-table.txt .


RUN apt update --fix-missing \
    && apt clean

EXPOSE 2101

CMD ["/app/str2str", "-in", "ntripc_s://localhost:2101", "-out", "ntripc_c://:2101", "-ft", "./source-table.txt"]