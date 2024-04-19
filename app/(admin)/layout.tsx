'use client'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {Layout, Menu, MenuProps, theme} from 'antd';

import {
  DesktopOutlined, FileOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import Link from "next/link";
import {useState} from "react";

type MenuItem = Required<MenuProps>['items'][number];
const {Sider, Content} = Layout;

function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem((<Link href={"/news"}>news</Link>), '1', <FileOutlined/>),
  getItem('Option 2', '2', <DesktopOutlined/>),
  getItem('User', 'sub1', <UserOutlined/>, [
    getItem('Tom', '3'),
    getItem('Bill', '4'),
    getItem('Alex', '5'),
  ]),
  getItem('Team', 'sub2', <TeamOutlined/>,
      [getItem('Team 1', '6'), getItem('Team 2', '8')
      ]),
];

export default function AdminLayout({children,}: Readonly<{ children: React.ReactNode }>) {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: {colorBgContainer, borderRadiusLG},
  } = theme.useToken();

  return (
      <Layout className={"min-h-[100vh]"}>
        <Sider trigger={null} collapsible collapsed={collapsed}>
          <div
              onClick={() => setCollapsed(!collapsed)}
              className="demo-logo-vertical min-h-[80px] bg-[gray] mx-[3px] roundex-xl flex items-center justify-center">
            <h1 className={"text-[#FFFFFF]"}>socar logo1</h1>
          </div>
          <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items}/>
        </Sider>
        <Layout>
          {/*<Header style={{padding: 0, background: colorBgContainer}}>*/}
          {/*  <Button*/}
          {/*      type="text"*/}
          {/*      icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}*/}
          {/*      onClick={() => setCollapsed(!collapsed)}*/}
          {/*      style={{*/}
          {/*        fontSize: '16px',*/}
          {/*        width: 64,*/}
          {/*        height: 64,*/}
          {/*      }}*/}
          {/*  />*/}
          {/*</Header>*/}
          <Content
              className={"w-[calc(100%-32px)]"}
              style={{
                maxWidth: "1440px",
                margin: '16px auto',
                padding: "12px 16px",
                minHeight: 280,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
  );
}
