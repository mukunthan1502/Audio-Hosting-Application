import { UploadOutlined } from "@ant-design/icons";
import { Button, Input, Upload } from "antd";
import { useEffect, useState, memo } from "react";
import { Space, Table, message } from "antd";
import { getUserAudioCollections, deleteAudioTrack, handleFileUpload } from "../backendServices/audioService";
import { CustomVerticalSpace, CustomModalWithButtonCom } from "../components/styledComponents";

const audioProps = {
    name: "file",
    headers: {
        authorization: "authorization-text",
    },
    beforeUpload: (file) => {
        const isAudio = file.type === "audio/mpeg";
        if (!isAudio) {
            message.error(`${file.name} is not a audio file`);
        }
        return isAudio || Upload.LIST_IGNORE;
    },
};

const b64toBlob = (b64Data, contentType = "", sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    return byteArrays;
};

export const AudioManagement = (props) => {
    const [audioCollection, setAudioCollection] = useState([]);
    const [loadingStatus, setLoadingStatus] = useState(true);
    const [showUpload, setShowUpload] = useState(false);

    const prepareDataAsync = (eachAudio) => {
        return new Promise((resolve, reject) => {
            const fileContent = b64toBlob(eachAudio.fileContent);
            resolve({ ...eachAudio, fileContent });
        });
    };

    useEffect(() => {
        setLoadingStatus(true);
        // console.time("Total_Audio_Fetch_Time");
        getUserAudioCollections()
            .then((response) => {
                const dataObj = response.collection;
                let promiseList = [];
                for (const audio of dataObj) {
                    promiseList.push(prepareDataAsync(audio));
                }
                console.log("promiseList", promiseList);
                Promise.allSettled(promiseList).then((result) => {
                    const resolvedResults = result.filter(({ status }) => status === "fulfilled");
                    const collection = resolvedResults.map(({ status, value }) => {
                        const UintArryLength = value.fileContent.reduce((total, cur) => total + cur.length, 0);
                        let mergedArray = new Uint8Array(UintArryLength);
                        let offset = 0;
                        value.fileContent.forEach((item) => {
                            mergedArray.set(item, offset);
                            offset += item.length;
                        });
                        return { ...value, fileContent: mergedArray };
                    });
                    setAudioCollection(collection);
                });
            })
            .catch((e) => {
                console.error("error fetching user audio collection", e);
            })
            .finally(() => {
                setLoadingStatus(false);
                // console.timeEnd("Total_Audio_Fetch_Time");
            });
    }, []);

    const addToCollection = (newRecord) => {
        setAudioCollection((prev) => [...prev, newRecord]);
        setShowUpload(false);
    };

    const onDeleteRecord = (fileToBeDeleted) => {
        deleteAudioTrack({ key: fileToBeDeleted.key });
        setAudioCollection((prev) => prev.filter((record) => record.key !== fileToBeDeleted.key));
        message.success(`${fileToBeDeleted.fileName} removed from collection`);
    };

    return (
        <>
            <h1>Audio Manangement Page</h1>
            <CustomModalWithButtonCom
                state={showUpload}
                stateSetter={setShowUpload}
                title={"Add Audio Track"}
                btnText="Add Audio"
            >
                <AudioFileUploader onUpdateCollection={addToCollection} />
            </CustomModalWithButtonCom>
            <AudioDisplayTable loading={loadingStatus} audioCollection={audioCollection} onDelete={onDeleteRecord} />
        </>
    );
};

const AudioFileUploader = ({ onUpdateCollection }) => {
    const [audio, setaudio] = useState(null);
    const [audioDescription, setAudioDescription] = useState("");
    const [audioCategory, setAudioCategory] = useState("");
    const [fileList, setFileList] = useState([]);

    const addToCollection = async () => {
        const file = audio;
        if (file.status !== "success") {
            message.error("Error uploading file " + (file.name ?? ""));
            console.log("Unable to upload file", file);
            return;
        }
        let fObj = await file.originFileObj.arrayBuffer();
        let uArray = new Uint8Array(fObj);
        const fileName = file.name;
        const key = file.uid.split("rc-upload-").at(-1);

        onUpdateCollection({
            audioCategory,
            audioDescription,
            fileName,
            fileContent: uArray,
            key: file.uid.split("rc-upload-").at(-1),
        });

        handleFileUpload(file, { fileName, key, audioCategory, audioDescription });
        setAudioDescription("");
        setAudioCategory("");
        setaudio(null);
        setFileList([]);
        message.success(`${file.name} added to collection`);
    };

    const uploadFile = (e, v) => {
        if (audio && audio.uid === e.file.uid) {
            if (!e.event) return;
            const updatedFile = { ...e.file, status: e.file.percent === 100 ? "success" : e.file.status };
            setaudio(updatedFile);
        } else {
            /* new upload */
            let file = e.fileList.find((f) => f.uid.includes("rc-upload") && f.uid === e.file.uid);
            setaudio(file);
            setFileList(e.fileList);
        }
    };

    return (
        // <CustomCard title="Upload Audio">
        <CustomVerticalSpace>
            <Input
                value={audioCategory}
                onChange={(e) => setAudioCategory(e.target.value)}
                placeholder="Audio Category"
            />

            <Input.TextArea
                value={audioDescription}
                onChange={(e) => setAudioDescription(e.target.value)}
                placeholder="Audio Description"
            />

            <Upload {...audioProps} onChange={uploadFile} maxCount={1} fileList={fileList} accept="audio/mpeg">
                <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>

            <Button
                type="primary"
                disabled={!(audioDescription.length && audioCategory.length && audio)}
                onClick={addToCollection}
            >
                Add To Collection
            </Button>
        </CustomVerticalSpace>
        // </CustomCard>
    );
};

const AudioDisplayTable = memo(
    ({ loading, onDelete, audioCollection }) => {
        const columns = [
            {
                title: "File Name",
                dataIndex: "fileName",
                key: "fileName",
            },
            {
                title: "Category",
                dataIndex: "audioCategory",
                key: "audioCategory",
            },
            {
                title: "Description",
                dataIndex: "audioDescription",
                key: "audioDescription",
            },
            {
                title: "Action",
                key: "action",
                render: (_, record) => {
                    const blob = new Blob([record.fileContent], { type: "audio/mpeg" });
                    const blobURL = window.URL.createObjectURL(blob);
                    return (
                        <Space size="middle">
                            <Button onClick={() => onDelete(record)}>Delete</Button>
                            <audio autoPlay={false} controls src={blobURL} type="audio/mp3"></audio>{" "}
                        </Space>
                    );
                },
            },
        ];

        return <Table loading={loading} theme="dark" columns={columns} dataSource={audioCollection} />;
    },
    (prevProps, nextProps) =>
        prevProps.audioCollection.length === nextProps.audioCollection.length && prevProps.loading === nextProps.loading
);
