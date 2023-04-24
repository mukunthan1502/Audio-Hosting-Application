import { Form, InputNumber, Popconfirm, Table, Input, Button, Space, message, Switch } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { getAllUsersList, addNewUser, deleteUser, updateUsers } from "../backendServices/userService";
import { CustomVerticalSpace, CustomModalWithButtonCom } from "../components/styledComponents";
import { v4 as uuidv4 } from "uuid";

export const AccountManagement = () => {
    const [data, setData] = useState([]);
    const [showAddUser, setShowAddUser] = useState(false);

    const deleteRecord = async (record) => {
        const response = await deleteUser(record);
        if (response.status === "fail") {
            message.error(response.statusMsg);
            return;
        }
        setData((prev) => prev.filter((row) => row.key !== record.key));
    };

    useEffect(() => {
        (async () => {
            const users = await getAllUsersList();
            console.log("AccountManagement:::userList", users);
            setData(users?.usersList?.map((user) => ({ ...user, key: user.userID })) ?? []);
        })();
    }, []);

    const appendNewRow = (newUser) => {
        setData((prev) => [...prev, { ...newUser, key: newUser.userID ?? prev.length }]);
        setShowAddUser(false);
    };

    return (
        <>
            <h1>Accounts Management</h1>
            <CustomModalWithButtonCom
                state={showAddUser}
                stateSetter={setShowAddUser}
                title={"Add New User"}
                btnText="Add User"
            >
                <NewAccountComp allUsers={data} addAccount={appendNewRow} />
            </CustomModalWithButtonCom>
            <AccountManagementTable originData={data} onDelete={deleteRecord} updateUserData={setData} />
        </>
    );
};

export const NewAccountComp = ({ selfSignUp = false, addAccount }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user");
    const usernameRef = useRef(null);

    const addNewAccount = async () => {
        const allFieldsCompleted = [username, password, role].every((eachField) => !!eachField.length);
        if (!allFieldsCompleted) {
            message.error("Incomplete information for new user account");
            return;
        }
        const userID = uuidv4();
        const newUser = { userID, username, password, role };
        const response = await addNewUser({ newUser, selfSignUp });
        if (response.status === "fail") {
            message.error(response.statusMsg);
        } else {
            addAccount && addAccount(newUser);
            message.success("Added new account");
        }
        setUsername("");
        setPassword("");
        setRole("user");
    };

    return (
        // <CustomCard title={selfSignUp ? "Sign Up For Account" : "Add New User"}>
        <CustomVerticalSpace>
            <Input
                ref={usernameRef}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
            />
            <Input.Password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                visibilityToggle
            />
            <Switch
                //force it to be false to that it is always enabled
                // this is done so that this application can be tested without init database source with admin users populated
                // admin and non-admin account can be created, hence application can be run with just compose file
                disabled={selfSignUp && false}
                checked={role === "admin"}
                onChange={(checked) => setRole(checked ? "admin" : "user")}
                checkedChildren="Admin"
                unCheckedChildren="User"
                style={{ width: 90 }}
            />
            <Button type="primary" onClick={addNewAccount} disabled={!(username.length && password.length)}>
                {selfSignUp ? "Sign Up" : "Add User"}
            </Button>
        </CustomVerticalSpace>
        // </CustomCard>
    );
};

const EditableCell = ({ editing, dataIndex, title, inputType, record, index, children, ...restProps }) => {
    const inputNode = inputType === "number" ? <InputNumber /> : <Input />;
    return (
        <td {...restProps}>
            {editing ? (
                dataIndex === "role" ? (
                    <Form.Item
                        name={dataIndex}
                        style={{
                            margin: 0,
                        }}
                        rules={[
                            {
                                required: true,
                                message: `Please Input ${title}!`,
                            },
                        ]}
                    >
                        <Switch
                            defaultChecked={children[1] === "admin"}
                            checkedChildren="Admin"
                            unCheckedChildren="User"
                        />
                    </Form.Item>
                ) : (
                    <Form.Item
                        name={dataIndex}
                        style={{
                            margin: 0,
                        }}
                        rules={[
                            {
                                required: true,
                                message: `Please Input ${title}!`,
                            },
                        ]}
                    >
                        {inputNode}
                    </Form.Item>
                )
            ) : (
                children
            )}
        </td>
    );
};

const AccountManagementTable = ({ originData, onDelete, updateUserData }) => {
    const [form] = Form.useForm();
    const [editingKey, setEditingKey] = useState("");
    const isEditing = (record) => record.key === editingKey;

    const edit = (record) => {
        console.log("edit:::record", record);
        const password = originData.find((row) => row.userID === record.userID)?.password ?? "";
        form.setFieldsValue({
            username: "",
            // password: "",
            userID: "",
            role: "",
            ...record,
            password,
        });
        setEditingKey(record.key);
    };
    const cancel = () => {
        setEditingKey("");
    };
    const save = async (key) => {
        try {
            const roleLookup = {
                true: "admin",
                admin: "admin",
                false: "user",
                user: "user",
            };
            const row = await form.validateFields();
            row.role = roleLookup[row.role];

            const usernameAlrExist = originData
                .filter((record) => record.key !== key)
                .some((record) => record.username === row.username);
            if (usernameAlrExist) {
                message.error("Username already exist, try another username");
                return;
            }

            const originalRow = originData.find((record) => record.key === key);
            const updatedUserDetails = { ...originalRow, ...row };
            const response = await updateUsers(updatedUserDetails);
            if (response.status === "fail") {
                message.error(response.statusMsg);
                setEditingKey("");
                return;
            }

            const newData = [...originData];
            const index = newData.findIndex((item) => key === item.key);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, {
                    ...item,
                    ...row,
                });
                updateUserData(newData);
                setEditingKey("");
                message.success("Record has been modified");
            } else {
                newData.push(row);
                updateUserData(newData);
                setEditingKey("");
                message.success("Record has been appended");
            }
        } catch (errInfo) {
            console.log("Validate Failed:", errInfo);
            message.error("Validation Error");
        }
    };
    const columns = [
        {
            title: "UserID",
            dataIndex: "userID",
            width: "11%",
            editable: false,
        },
        {
            title: "Username",
            dataIndex: "username",
            width: "15%",
            editable: true,
        },
        {
            title: "Password",
            dataIndex: "password",
            width: "15%",
            editable: true,
        },
        {
            title: "Account Type",
            dataIndex: "role",
            width: "15%",
            editable: true,
        },
        {
            title: "Actions",
            dataIndex: "operation",
            width: "20%",
            render: (_, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <Space size="middle">
                        <Button type="primary" onClick={() => save(record.key)}>
                            Save
                        </Button>
                        <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
                            <Button>Cancel</Button>
                        </Popconfirm>
                    </Space>
                ) : (
                    <Space size="middle">
                        <Button disabled={editingKey !== ""} onClick={() => edit(record)}>
                            Edit
                        </Button>

                        <Button disabled={editingKey !== ""} onClick={() => onDelete(record)}>
                            Delete
                        </Button>
                    </Space>
                );
            },
        },
    ];
    const mergedColumns = columns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record) => ({
                record,
                inputType: "text",
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });

    const renderedData = useMemo(() => {
        return originData.map((row) => ({ ...row, password: "**********" }));
    }, [originData]);

    return (
        <Form form={form} component={false}>
            <Table
                components={{
                    body: {
                        cell: EditableCell,
                    },
                }}
                bordered
                dataSource={renderedData}
                columns={mergedColumns}
                rowClassName="editable-row"
                pagination={{
                    onChange: cancel,
                }}
            />
        </Form>
    );
};
