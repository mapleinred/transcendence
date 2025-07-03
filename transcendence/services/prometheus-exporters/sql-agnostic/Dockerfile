FROM golang:1.24-alpine AS build
ENV CGO_CFLAGS="-D_LARGEFILE64_SOURCE"
ARG DB_FILENAME
# gcc package is needed for this error:
# runtime/cgo
# cgo: C compiler "gcc" not found: exec: "gcc": executable file not found in $PATH

# musl-dev package is needed for libc headers, eg /usr/include/stdlib.h (not found)
# runtime/cgo
# _cgo_export.c:3:10: fatal error: stdlib.h: No such file or directory
#     3 | #include <stdlib.h>
#       |          ^~~~~~~~~~
# compilation terminated.

# Bind-mount is read-only by default, tar will extract inside the mounted dir
RUN --mount=from=db-exporter,target=/db-exporter,rw \
    cd /db-exporter && \
    tar -xzvf ./database_exporter-0.6.8.tar.gz && \
    apk add --virtual --no-cache make gcc musl-dev && \
    cd database_exporter-0.6.8 && \
    make && \
    # ** Need to use backslash to escape whitespace chars ** \
    sed -i -e "/data_source_name:/c\ \ data_source_name: 'sqlite3:\/\/file:${DB_FILENAME}?cache=shared&mode=rwc'" \
      -e "s/config\/sqlite_collectors\///g" \
      database_exporter.yml && \
    mkdir -p /sql && \
    mv database_exporter* config/sqlite_collectors/sqlite.collector.yml /sql
# can't use actual tab characters, instead 2 space indentation is used for yml files
# Careful - Single quotes will escape variable expansion

FROM alpine:3.20
# gcompat package gives me /lib64/ld-linux-x86-64.so.2 file, which is needed according to this command:
# readelf -l [executable: database_exporter] | grep "program interpreter"
RUN apk add --no-cache gcompat
#rm -rf /var/cache/apk/*
# Remember to put a trailing slash on destination to guarantee a directory is created, else its treated as a file
COPY --from=build /sql /sql/
WORKDIR /sql
ENTRYPOINT ["./database_exporter"]
# Reference: https://github.com/mattn/go-oci8/issues/388
# 1) (optional) set ENV CGO_ENABLED="1" if this error appears:
# 3.434 # github.com/mattn/go-oci8
# 3.434 pkg/mod/github.com/mattn/go-oci8@v0.1.1/connector.go:14:10: undefined: Connector
# 3.434 pkg/mod/github.com/mattn/go-oci8@v0.1.1/connector.go:20:18: undefined: Connector
# 3.434 pkg/mod/github.com/mattn/go-oci8@v0.1.1/connector.go:21:9: undefined: Driver
# 3.434 pkg/mod/github.com/mattn/go-oci8@v0.1.1/connector.go:25:18: undefined: Connector
# 3.434 pkg/mod/github.com/mattn/go-oci8@v0.1.1/connector.go:30:11: undefined: Conn

# Reference: https://github.com/mattn/go-sqlite3/issues/1164
# 2) set ENV CGO_CFLAGS="-D_LARGEFILE64_SOURCE" for this error:
# 8.607 # github.com/mattn/go-sqlite3
# 8.607 sqlite3-binding.c:38268:42: error: 'pread64' undeclared here (not in a function); did you mean 'pread'?
# 8.607 38268 |   { "pread64",      (sqlite3_syscall_ptr)pread64,    0  },
# 8.607       |                                          ^~~~~~~
# 8.607       |                                          pread
# 8.607 sqlite3-binding.c:38286:42: error: 'pwrite64' undeclared here (not in a function); did you mean 'pwrite'?
# 8.607 38286 |   { "pwrite64",     (sqlite3_syscall_ptr)pwrite64,   0  },
# 8.607       |                                          ^~~~~~~~
# 8.607       |                                          pwrite
# 8.607 sqlite3-binding.c: In function 'seekAndRead':
# 8.607 sqlite3-binding.c:38272:49: error: unknown type name 'off64_t'; did you mean 'off_t'?
# 8.607 38272 | #define osPread64 ((ssize_t(*)(int,void*,size_t,off64_t))aSyscall[10].pCurrent)
# 8.607       |                                                 ^~~~~~~
# 8.607 sqlite3-binding.c:41128:11: note: in expansion of macro 'osPread64'
# 8.607 41128 |     got = osPread64(id->h, pBuf, cnt, offset);
# 8.607       |           ^~~~~~~~~
# 8.607 sqlite3-binding.c:38272:58: error: expected ')' before 'aSyscall'
# 8.607 38272 | #define osPread64 ((ssize_t(*)(int,void*,size_t,off64_t))aSyscall[10].pCurrent)
# 8.607       |                   ~                                      ^~~~~~~~
# 8.607 sqlite3-binding.c:41128:11: note: in expansion of macro 'osPread64'
# 8.607 41128 |     got = osPread64(id->h, pBuf, cnt, offset);
# 8.607       |           ^~~~~~~~~
# 8.607 sqlite3-binding.c: In function 'seekAndWriteFd':
# 8.607 sqlite3-binding.c:38290:57: error: unknown type name 'off64_t'; did you mean 'off_t'?
# 8.607 38290 | #define osPwrite64  ((ssize_t(*)(int,const void*,size_t,off64_t))\
# 8.607       |                                                         ^~~~~~~
# 8.607 sqlite3-binding.c:41257:17: note: in expansion of macro 'osPwrite64'
# 8.607 41257 |   do{ rc = (int)osPwrite64(fd, pBuf, nBuf, iOff);}while( rc<0 && errno==EINTR);
# 8.607       |                 ^~~~~~~~~~
# 8.607 sqlite3-binding.c:38291:21: error: expected ')' before 'aSyscall'
# 8.607 38291 |                     aSyscall[13].pCurrent)
# 8.607       |                     ^~~~~~~~
# 8.607 sqlite3-binding.c:41257:17: note: in expansion of macro 'osPwrite64'
# 8.607 41257 |   do{ rc = (int)osPwrite64(fd, pBuf, nBuf, iOff);}while( rc<0 && errno==EINTR);
# 8.607       |                 ^~~~~~~~~~
# 8.607 sqlite3-binding.c:38290:21: note: to match this '('
# 8.607 38290 | #define osPwrite64  ((ssize_t(*)(int,const void*,size_t,off64_t))\
# 8.607       |                     ^
# 8.607 sqlite3-binding.c:41257:17: note: in expansion of macro 'osPwrite64'
# 8.607 41257 |   do{ rc = (int)osPwrite64(fd, pBuf, nBuf, iOff);}while( rc<0 && errno==EINTR);
# 8.607       |                 ^~~~~~~~~~
