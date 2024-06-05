'use client'
import {authService} from "@/services/auth.service";
import {Layout, Menu, MenuProps, theme} from 'antd';
import Image from "next/image";
import logoWithText from "../../public/images/logo.svg"
import logo from "../../public/images/favIcon.png"

import { DesktopOutlined, FileOutlined, FolderOpenOutlined, UserOutlined } from '@ant-design/icons';
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
  getItem('Products & Services', '1', <FolderOpenOutlined/>, [
    getItem((<Link href={"/E-card"}>E-card</Link>), '1-1',),
    getItem((<Link href={"/E-chargers"}>E-chargers</Link>), '1-2'),
    getItem((<Link href={"/self-service"}>Self service</Link>), '1-3'),
    getItem((<Link href={"/service-centers"}>Service centers</Link>), '1-4'),
    getItem((<Link href={"/way-mart"}>Way mart</Link>), '1-5'),
    getItem((<Link href={"/quality"}>Quality</Link>), '1-6'),
    getItem((<Link href={"/price-archive"}>Price archive</Link>), '1-7'),
    getItem((<Link href={"/locations"}>Locations </Link>), '1-8'),
  ]),
  getItem('Company', '2', <FolderOpenOutlined/>, [
    getItem((<Link href={"/about-company"}>About Company</Link>), '2-1',),
    getItem((<Link href={"/socar-global"}>SOCAR Global</Link>), '2-2'),
    getItem((<Link href={"/management"}>Management</Link>), '2-3'),
  ]),
  getItem('Business', '3', <FolderOpenOutlined/>, [
    getItem((<Link href={"/about-company"}>Corporate Services</Link>), '3-1',),
    getItem((<Link href={"/corporate-cabinet"}>Corporate Cabinet</Link>), '3-2'),
    getItem((<Link href={"/tenders"}>Tenders</Link>), '3-3'),
  ]),

  getItem((<Link href={"/slide"}>Main Slide</Link>), '4', <DesktopOutlined/>),

  getItem((<Link href={"/news"}>News</Link>), '5', <FileOutlined/>),
  getItem((<Link href={"/timeline"}>Timeline</Link>), '6', <DesktopOutlined/>),
  getItem((<Link href={"/info-card"}>Info Card</Link>), '7', <FileOutlined/>),
  getItem((<Link href={"/management"}>Management Persons</Link>), '8', <UserOutlined/>),
  getItem((<Link href={"/service-center"}>Service Center</Link>), '9', <FileOutlined/>),

];

const items2: MenuItem[] = [
  {type: 'divider'},
  getItem((<div onClick={() => authService.logout()}>Log out</div>), '0', <FileOutlined/>),
];


export default function AdminLayout({children,}: Readonly<{ children: React.ReactNode }>) {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: {colorBgContainer, borderRadiusLG},
  } = theme.useToken();

  return (
      <Layout className={"admin-layout"}>
        <Sider trigger={null}
               collapsible
               collapsed={collapsed}
               className={"flex flex-col justify-between !fixed left-0 bottom-0 top-0"}>
          <div>
            <div
                onClick={() => setCollapsed(!collapsed)}
                className="demo-logo-vertical min-h-[80px] roundex-xl flex items-center justify-center border-b-[1px]">
              {
                collapsed ? 
                  <Image src={logo} width={50} height={50} alt='logo' className="cursor-pointer"/>
                :
                  <Image src={logoWithText} width={100} height={100} alt='logo' className="cursor-pointer" />
              }
            </div>
            <Menu theme="dark" mode="vertical" defaultSelectedKeys={['']} items={items}/>
          </div>

          <Menu theme="dark" mode="inline" items={items2}/>
        </Sider>
        <Layout className={"min-h-[100vh]"}
                style={{
                  transition: '0.2s',
                  marginLeft: collapsed ? "80px" : "200px"
                }}
        >
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
                // padding: "12px 16px",
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
