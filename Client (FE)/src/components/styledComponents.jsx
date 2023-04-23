import { Card, Form } from "antd";

export const CustomCard = ({ children, title, otherProps = {} }) => (
    <Card
        title={title}
        bordered={true}
        headStyle={{ borderBottomWidth: "3px" }}
        style={{
            width: 300,
            borderWidth: "2px",
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
