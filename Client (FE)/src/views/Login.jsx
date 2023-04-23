import { useNavigate } from "react-router";
import { Form, Checkbox, Input, Button } from "antd";
// import { authenticateUserLogin } from "../dataHandles/userService";
import { LoginContainer, LoginTextFieldContainer } from "../components/styledComponents";
import { routerPath } from "../common/config";
import { AuthLogin } from "../contexts/authLogin";
import { useContext } from "react";

const loginFormProps = {
    name: "basic",
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
    style: { maxWidth: 600 },
    initialValues: { remember: true },
    autoComplete: "off",
    onFinishFailed: (errorInfo) => console.log("Failed:", errorInfo),
};

export const LoginPage = (props) => {
    const { authenicateUserLogin } = useContext(AuthLogin);
    const navigate = useNavigate();
    const onFinish = async (values) => {
        console.log("values", values);
        if (await authenicateUserLogin(values.username, values.password)) {
            navigate(routerPath.account);
        }
        // const loginStatus = await authenticateUserLogin(values);
        // if (!loginStatus.authenticateStatus) {
        //     message.error(loginStatus.message);
        //     return;
        // }
        // message.success(loginStatus.message);
        // sessionStorage.setItem("authToken", loginStatus.jwt);
        // navigate(routerPath.account);
    };

    return (
        <LoginContainer>
            <h1>Login Page</h1>
            <Form {...loginFormProps} onFinish={onFinish}>
                <LoginTextFieldContainer name="username">
                    <Input />
                </LoginTextFieldContainer>

                <LoginTextFieldContainer name="password">
                    <Input.Password />
                </LoginTextFieldContainer>

                <Form.Item
                    name="remember"
                    valuePropName="checked"
                    wrapperCol={{
                        offset: 8,
                        span: 16,
                    }}
                >
                    <Checkbox>Remember me</Checkbox>
                </Form.Item>

                <Form.Item
                    wrapperCol={{
                        offset: 8,
                        span: 16,
                    }}
                >
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </LoginContainer>
    );
};
