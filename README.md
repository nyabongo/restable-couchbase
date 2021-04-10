# What is restable-couchbase

This is a plugin for the [Restable Specification](https://github.com/nyabongo/restable) it allows you to quickly get started using a couchbase database for your projects with simple REST calls without having to use couchbase specific API's and tools.

# How to use this Image

## Start a restable-couchbase instance
```console
$ docker run --network some-network --name some-restable-couchbase \
    -e COUCHBASE_URL=couchbase://123.456.789 \
    -e COUCHBASE_USERNAME=Administrator \
    -e COUCHBASE_PASSWORD=secret \
    -e COUCHBASE_BUCKET=travel-summary \
    nyabongo/restable-couchbase
```
## Environment Variables

To run the Restable-Couchbase image as  a container you need to provide some environment variables to help connect to the couchbase instance

### `COUCHBASE_URL`
This  Variable is **Mandatory** It is the url of the couchbase instance you want to connect to

### `COUCHBASE_USERNAME`
This  Variable is **Mandatory** it is your couchbase username


### `COUCHBASE_PASSWORD`
This  Variable is **Mandatory** it is your couchbase password


### `COUCHBASE_BUCKET`
This  Variable is **Mandatory** it is the name of the couchbase bucket you want to connect to, for example `travel-summary`
