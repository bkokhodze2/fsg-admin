'use client'
import {axiosClassic} from "@/configs/axios";
import {authService} from "@/services/auth.service";
import {LockFilled, LockOutlined, UserOutlined} from "@ant-design/icons";
import React from 'react';
import type {FormProps} from 'antd';
import {Button, Card, Checkbox, Divider, Form, Input, notification, Watermark} from 'antd';
import image from "../../public/images/lock.png"
import {useRouter} from "next/navigation";

type FieldType = {
  username: string;
  password: string;
  remember?: string;
  grantType?: string;
};

export default function Login() {
  const Router = useRouter();
  const [form] = Form.useForm();

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    values.grantType = 'SGP_GE_ADMIN';
    const res = await authService.login('login', values)

    if (res.status === 200) {
      notification.open({
        type: 'success',
        message: `auth`,

      });

      await Router.push('/news')
    }

    if (res.status === 401) {
      form.setFields([
        {
          name: "username",
          value: values.username,
          errors: ["invalid credentials"]
        },
        {
          name: "password",
          value: values.password,
          errors: ["invalid credentials"]
        }
      ])

      notification.open({
        type: 'error',
        message: `Login`,
        description:
            'invalid credential',
      });
    }

    // try {
    //   let res = await axiosClassic.post('/auth/login', )
    //   if (res) {
    //     console.log("res", res)
    //   }
    // } catch (e: any) {
    //   console.log(e)
    // }


  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
      <main className="">
        <Watermark
            className={'h-[100vh] flex items-center justify-center bg-[#f1f1f1]'}
            height={33}
            width={30}
            rotate={-30}
            gap={[100, 200]}
            image={image.src}
        >
          <Card className={"w-full max-w-[400px] h-min bg-white z-20 mb-[150px] mx-4 rounded-2xl"} title={""}>
            <Form
                form={form}
                className={"loginForm"}
                layout={"vertical"}
                size={'large'}
                name="basic"
                initialValues={{remember: true}}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
            >
              <Divider orientation="center" className={"!my-0"}><h3 className={"text-[25px]"}>LOGIN</h3></Divider>
              <Form.Item<FieldType>

                  label="Username"
                  name="username"
                  rules={[{required: true, message: 'Please input your username!'}]}
              >
                <Input placeholder={"type username"} prefix={<UserOutlined/>}/>
              </Form.Item>

              <Form.Item<FieldType>
                  label="Password"
                  name="password"
                  rules={[{required: true, message: 'Please input your password!'}]}
              >
                <Input.Password placeholder={"type password"} prefix={<LockOutlined/>}/>
              </Form.Item>

              <Form.Item<FieldType>
                  name="remember"
                  valuePropName="checked"
              >
                <Checkbox>Remember me</Checkbox>
              </Form.Item>

              <Form.Item className={"m-auto flex items-center justify-center"}>
                <Button size={'large'} type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Watermark>
      </main>
  );
}
