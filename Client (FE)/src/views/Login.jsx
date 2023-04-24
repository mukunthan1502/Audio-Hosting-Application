import { useNavigate } from "react-router";
import { Form, Checkbox, Input, Button } from "antd";
import { LoginContainer, LoginTextFieldContainer } from "../components/styledComponents";
import { routerPath } from "../common/config";
import { AuthLogin } from "../contexts/authLogin";
import { useContext, useState } from "react";
import { NewAccountComp } from "./AccountManagement";
import { CustomModalWithLinkCom } from "../components/styledComponents";

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
    const [showSignUp, setShowSignUp] = useState(false);
    const { authenicateUserLogin } = useContext(AuthLogin);
    const navigate = useNavigate();
    const onFinish = async (values) => {
        console.log("values", values);
        if (await authenicateUserLogin(values.username, values.password)) {
            navigate(routerPath.account);
        }
    };

    return (
        <>
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

                    <CustomModalWithLinkCom
                        state={showSignUp}
                        stateSetter={setShowSignUp}
                        title={"Sign Up For Account With Us"}
                        linkText="Create Account"
                    >
                        <NewAccountComp selfSignUp={true} addAccount={() => setShowSignUp(false)} />
                    </CustomModalWithLinkCom>
                </Form>
            </LoginContainer>
        </>
    );
};
