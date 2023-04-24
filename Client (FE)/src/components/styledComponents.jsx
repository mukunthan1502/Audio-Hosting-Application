import { Card, Form, Modal, Button } from "antd";

export const CustomCard = ({ children, title, otherProps = {} }) => (
    <Card
        // title={title}
        // bordered={true}
        headStyle={{ borderBottomWidth: "3px" }}
        style={{
            width: 380,
            // borderWidth: "2px",
            marginLeft: "auto",
            marginRight: "auto",
            ...(otherProps.style ?? {}),
        }}
        {...(otherProps.card ?? {})}
    >
        {children}
    </Card>
);

export const LoginContainer = ({ children }) => {
    return <div className="loginContainer">{children}</div>;
};

export const LoginTextFieldContainer = ({ children, name }) => (
    <Form.Item
        label={name.charAt(0).toUpperCase() + name.slice(1)}
        name={name}
        rules={[
            {
                required: true,
                message: `Please input your ${name}!`,
            },
        ]}
    >
        {children}
    </Form.Item>
);

export const MainContentContainer = ({ children }) => <div style={{ padding: "10px 20px" }}>{children}</div>;

export const CustomModalCom = ({ state, stateSetter, title, children }) => {
    return (
        <Modal
            title={title}
            open={state}
            onCancel={() => stateSetter(false)}
            onOk={() => stateSetter(false)}
            footer={null}
            centered
            width={430}
        >
            {children}
        </Modal>
    );
};

export const CustomModalWithButtonCom = ({ state, stateSetter, title, children, btnText }) => {
    return (
        <>
            <div style={{ display: "flex", justifyContent: "flex-end", marginRight: 20 }}>
                <Button style={{ marginBottom: 10 }} type="primary" size={"large"} onClick={() => stateSetter(true)}>
                    {btnText}
                </Button>
            </div>
            <CustomModalCom {...{ state, stateSetter, title }}>{children}</CustomModalCom>
        </>
    );
};

export const CustomModalWithLinkCom = ({ state, stateSetter, title, children, linkText }) => {
    return (
        <>
            <div style={{ display: "flex", justifyContent: "center" }}>
                <Button type="link" block onClick={() => stateSetter(true)}>
                    {linkText}
                </Button>
            </div>
            <CustomModalCom {...{ state, stateSetter, title }}>{children}</CustomModalCom>
        </>
    );
};

// custom implementation of antd Space
export const CustomVerticalSpace = ({ children }) => (
    <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>{children}</div>
);
