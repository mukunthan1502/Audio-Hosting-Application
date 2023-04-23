import { BackendEndpointURL, constructBeEndpoint } from "../common/config";

export class ChunkUploader {
    constructor() {
        this.chunkSize = 1024 * 1024;
        this.threadsQuantity = 2;
        this.file = null;
        this.aborted = false;
        this.uploadedSize = 0;
        this.progressCache = {};
        this.activeConnections = {};
    }

    setOptions(options = {}) {
        this.chunkSize = options.chunkSize;
        this.threadsQuantity = options.threadsQuantity;
        this.info = options.info;
    }

    setupFile(file) {
        if (!file) {
            return;
        }
        this.file = file;
    }

    start() {
        const chunksQuantity = Math.ceil(this.file.size / this.chunkSize);
        this.chunksQueue = new Array(chunksQuantity)
            .fill()
            .map((_, index) => index)
            .reverse();
        const reqOptions = {
            method: "POST",
            headers: {
                "X-Content-Length": this.file.size,
                "X-Content-Name": this.file.name,
                "X-Chunks-Quantity": chunksQuantity,
            },
        };

        const { initAudioUpload } = BackendEndpointURL;
        const endpoint = constructBeEndpoint(initAudioUpload);
        console.log("upload/init", endpoint);

        fetch(endpoint, reqOptions)
            .then((res) => res.json())
            .then((data) => {
                console.log("start:::data", data);
                if (!data.fileId || data.status !== 200) {
                    this.complete(new Error("Can't create file id"));
                    return;
                }

                this.fileId = data.fileId;
                this.sendNext();
            })
            .catch((error) => {
                this.complete(error);
            });
    }

    sendNext() {
        const activeConnections = Object.keys(this.activeConnections).length;

        if (activeConnections >= this.threadsQuantity) {
            return;
        }

        if (!this.chunksQueue.length) {
            if (!activeConnections) {
                this.complete(null);
            }

            return;
        }

        const chunkId = this.chunksQueue.pop();
        const sentSize = chunkId * this.chunkSize;
        const chunk = this.file.slice(sentSize, sentSize + this.chunkSize);

        this.sendChunk(chunk, chunkId)
            .then(() => {
                this.sendNext();
            })
            .catch((error) => {
                this.chunksQueue.push(chunkId);

                this.complete(error);
            });

        this.sendNext();
    }

    complete(error) {
        if (error && !this.aborted) {
            this.end(error);
            return;
        }
        this.end(error);
    }

    sendChunk(chunk, id) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await this.upload(chunk, id, this);
                const { status, size } = JSON.parse(response);

                if (status !== 200 || size !== chunk.size) {
                    reject(new Error("Failed chunk upload"));
                    return;
                }
            } catch (error) {
                reject(error);
                return;
            }

            resolve();
        });
    }

    handleProgress = function (chunkId, event) {
        if (event.type === "progress" || event.type === "error" || event.type === "abort") {
            this.progressCache[chunkId] = event.loaded;
        }

        if (event.type === "loadend") {
            this.uploadedSize += this.progressCache[chunkId] || 0;
            delete this.progressCache[chunkId];
        }
    };

    upload(file, id) {
        return new Promise((resolve, reject) => {
            const xhr = (this.activeConnections[id] = new XMLHttpRequest());

            const { uploadAudioChunks } = BackendEndpointURL;
            const endpoint = constructBeEndpoint(uploadAudioChunks);
            console.log("upload", endpoint);

            xhr.open("post", endpoint);
            xhr.setRequestHeader("Content-Type", "application/octet-stream");
            xhr.setRequestHeader("Content-Length", file.size);
            xhr.setRequestHeader("X-Content-Id", this.fileId);
            xhr.setRequestHeader("X-Chunk-Id", id);
            xhr.setRequestHeader("Content-Info", JSON.stringify(this.info));
            xhr.setRequestHeader("Authorization", "Bearer " + sessionStorage.getItem("authToken"));

            xhr.onreadystatechange = (event) => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    resolve(xhr.responseText);
                    delete this.activeConnections[id];
                }
            };
            xhr.onerror = (error) => {
                reject(error);
                delete this.activeConnections[id];
            };

            xhr.onabort = () => {
                reject(new Error("Upload canceled by user"));
                delete this.activeConnections[id];
            };

            xhr.send(file);
        });
    }

    on(method, callback) {
        if (typeof callback !== "function") {
            callback = () => {};
        }

        this[method] = callback;
    }

    abort() {
        Object.keys(this.activeConnections).forEach((id) => {
            this.activeConnections[id].abort();
        });

        this.aborted = true;
    }

    options(options) {
        this.setOptions(options);
        return this;
    }

    send(file) {
        this.setupFile(file);
        return this;
    }

    end(callback) {
        this.on("end", callback);
        this.start();
        return this;
    }
}
