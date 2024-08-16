'use client'
import React, {useContext, useMemo} from "react";
import {axiosWithAuth} from "@/configs/axios";
import {useQuery} from "@tanstack/react-query";
import dayjs from "dayjs";

import {SizeType} from "antd/lib/config-provider/SizeContext";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {
  Button,
  Form,
  Input,
  Card,
  Divider,
  notification,
  Radio,
} from 'antd';

import {HolderOutlined} from '@ant-design/icons';
import SiteInfoAdvCard from "@/components/items/SiteInfoAdvCard";

import type {SyntheticListenerMap} from '@dnd-kit/core/dist/hooks/utilities';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

const BASEAPI = process.env.NEXT_PUBLIC_API_URL;
const fetchLanguages = async () => {
  try {
    const {data} = await axiosWithAuth.get(`${BASEAPI}/news-editor/get-languages`);
    return data;
  } catch (error: any) {
    console.log("errr", error)
    notification.open({
      type: 'error',
      message: `languages`,
      description:
          'Something went wrong while fetching languages',
    });
  }
}

interface IProps {
  id?: number
}

interface RowContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: SyntheticListenerMap;
}

interface RowContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: SyntheticListenerMap;
}

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
}

const RowContext = React.createContext<RowContextProps>({});
const DragHandle: React.FC = () => {
  const {setActivatorNodeRef, listeners} = useContext(RowContext);
  return (
      <Button
          type="text"
          size="large"
          icon={<HolderOutlined/>}
          style={{cursor: 'move'}}
          ref={setActivatorNodeRef}
          {...listeners}
      />
  );
};

const Row: React.FC<RowProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({id: props['data-row-key']});

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform && {...transform, scaleY: 1.05}),
    transition,
    position: isDragging ? "relative" : "static",
    zIndex: isDragging ? 9999 : "auto",
  };

  const contextValue = useMemo<RowContextProps>(
      () => ({setActivatorNodeRef, listeners}),
      [setActivatorNodeRef, listeners],
  );

  return (
      <RowContext.Provider value={contextValue}>
        <tr {...props} ref={setNodeRef} style={style} {...attributes} />
      </RowContext.Provider>
  );
};


const id = 1;

export default function SiteInfoPage() {
  const [form] = Form.useForm();
  const Router = useRouter();

  const fetchSiteInfoDetailsById = async (id: number) => {
    try {
      const {data} = await axiosWithAuth.get(`/site-info-editor/get-site-info-detail`, {
        params: {
          siteInfoId: id
        }
      });
      console.log('siteInfoData', data)
      return data;

    } catch (error: any) {
      console.log("errr", error)
      notification.open({
        type: 'error',
        message: `site info`,
        description:
            'Something went wrong while fetching site info details',
      });
    }
  }

  const fetchSiteAdvInfos = async () => {
    try {
      const {data} = await axiosWithAuth.get(`${BASEAPI}/site-info-editor/get-site-adv-infos`);
      return data;
    } catch (error: any) {
      console.log("errr", error)
      notification.open({
        type: 'error',
        message: `Info Adv`,
        description:
            'Something went wrong while fetching Info Adv items',
      });
    }
  }

  const isEditPage = !!id;
  const {data: dataLanguages} = useQuery<ILanguage[]>({queryKey: ["languages"], queryFn: fetchLanguages});
  const {data: dataInfoAdv, refetch} = useQuery({queryKey: ["infos"], queryFn: fetchSiteAdvInfos, enabled: !!id});

  console.log('Data Info ADV::::', dataInfoAdv)

  const {data: dataSiteInfoDetails} = useQuery({
    queryKey: ['details', id],
    queryFn: () => fetchSiteInfoDetailsById(id as number),
  });

  const onchange = (values: any) => {
    console.log("values", values)
  }
  const onFinish = async (values: any) => {
    console.log("vv", values)

    // Modify the form data here before submitting
    const modifiedValues = {
      ...values,
      id: isEditPage ? id : undefined,
      details: values.details.map((detail: any) => ({
        ...detail,
      }))
    };
    console.log("modifiedValues", modifiedValues)


    try {
      const res = await axiosWithAuth.post('/site-info-editor/add-or-modify-site-info-simple', modifiedValues)
      if (res.status == 200) {
        notification.open({
          type: 'success',
          message: `parter was added`,
        });
        Router.push(`/site-info/edit/${res?.data?.id}`)
      }
    } catch (e: any) {
      console.log("e",)
      notification.open({
        type: 'error',
        message: `${e.response.data.message || "error"}`,
      });
    }
  };

  const getDefaultValue = () => {
    if (isEditPage) {
      const newData = {
        ...dataSiteInfoDetails,
        details: dataSiteInfoDetails?.details.map((detail: any) => ({
          ...detail,
        }))
      };

      console.log("data", newData)

      return newData;
    } else {
      const activeLanguages = dataLanguages?.filter(e => e.active === true)

      return {
        "id": 0,
        "status": true,
        "mail": null,
        "phone": null,
        "tenderEmail": null,
        "tenderPhoneNumber": null,
        "facebookLink": null,
        "instagramLink": null,
        "linkedinLink": null,
        "youtubeLink": null,
        "androidAppLink": null,
        "iosAppLink": null,
        "tiktokLink": null,
        "details":
            activeLanguages?.map(e => {
              console.log('event', e)
              return {
                "id": null,
                "siteInfoId": null,
                "languageId": e.id,
                "addressText": null,
                "promotionTitle": null,
                "promotionSubTitle": null,
                "priceTitle": null,
                "PriceSubTitle": null,
                "socarGlobalTitle": null,
                "socarGlobalSubTitle": null,
                "ourTeamTitle": null,
                "ourTeamSubTitle": null,
                "faqTitle": null,
                "faqSubTitle": null,
                "serviceCenterTitle": null,
                "serviceCenterSubTitle": null,
                "csrTitle": null,
                "csrSubTitle": null,
                "priceArchiveTitle": null,
                "priceArchiveSubTitle": null,
                "corpCervicesTitle": null,
                "corpServicesSubTitle": null,
                "corpServicesSubTitle2": null,
                "hiTitle": null,
                "hiSubTitle": null,
                "peopleTitle": null,
                "peopleSubTitle": null,
                "latestNewsTitle": null,
                "latestNewsSubTitle": null,
                "stationsTitle": null,
                "stationsSubTitle": null,
                "tenderTitle": null,
                "tenderSubTitle": null,
                "tenderContactTitle": null,
                "tenderContactSubTitle": null,
                "noEnergyCardTitle": null,
                "waymartTitle": null,
                "waymartSubTitle": null,
              }
            }),
      }
    }
  }


  return (
      <>
        <div className="flex flex-col">
          <h2 className={"text-center text-[30px] w-full mb-4"}>Site Info</h2>
          <Divider className={"my-3 w-full"}/>
        </div>
        <div className={"p-2 pb-[60px]"}>
          <div className="w-full">
            {((isEditPage && dataSiteInfoDetails) || (!isEditPage && dataLanguages)) && <Form
                form={form}
                className={"grid grid-cols-2 gap-y-10"}
                layout="vertical"
                onValuesChange={onchange}
                onFinish={onFinish}
                size={'default' as SizeType}
                initialValues={getDefaultValue()}
            >
              <Form.List
                  name="details"
              >
                {(fields, v) => {
                  return <div className={"grid col-span-2 grid-cols-2 gap-x-5"}>
                    {
                      fields.map((field, index, c) => {
                        const languageId = form.getFieldValue(['details', field.name, 'languageId'])
                        const findLang = dataLanguages?.find((e) => e.id === languageId)?.language;

                        return (
                            <Card
                                key={fields[0].name + '' + index}
                                className={"border-[1px] rounded-2xl border-solid border-[#b2b2b2] "}
                            >
                              <Divider orientation="left" className={"!my-0"}>
                                <h3 className={"text-[25px]"}>{findLang}</h3>
                              </Divider>
                              <Form.Item
                                  name={[field.name, 'addressText']}
                                  label={'Address Text'}
                              >
                                <Input placeholder="Address Text"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'promotionTitle']}
                                  label={'Promotion Title'}
                              >
                                <Input placeholder="Promotion Title"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'promotionSubTitle']}
                                  label={'Promotion SubTitle'}
                              >
                                <Input placeholder="Promotion SubTitle"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'priceTitle']}
                                  label={'Price Title'}
                              >
                                <Input placeholder="Price Title"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'priceSubTitle']}
                                  label={'Price SubTitle'}
                              >
                                <Input placeholder="Price SubTitle"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'socarGlobalTitle']}
                                  label={'Socar Global Title'}
                              >
                                <Input placeholder="Socar Global Title"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'socarGlobalSubTitle']}
                                  label={'Socar Global SubTitle'}
                              >
                                <Input placeholder="Socar Global SubTitle"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'ourTeamTitle']}
                                  label={'Our Team Title'}
                              >
                                <Input placeholder="Our Team Title"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'ourTeamSubTitle']}
                                  label={'Our Team SubTitle'}
                              >
                                <Input placeholder="Our Team SubTitle"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'faqTitle']}
                                  label={'Faq Title'}
                              >
                                <Input placeholder="Faq Title"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'faqSubTitle']}
                                  label={'Faq SubTitle'}
                              >
                                <Input placeholder="Faq SubTitle"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'serviceCenterTitle']}
                                  label={'Service Center Title'}
                              >
                                <Input placeholder="Service Center Title"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'serviceCenterSubTitle']}
                                  label={'Service Center SubTitle'}
                              >
                                <Input placeholder="Service Center SubTitle"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'csrTitle']}
                                  label={'Csr Title'}
                              >
                                <Input placeholder="Csr Title"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'csrSubTitle']}
                                  label={'Csr SubTitle'}
                              >
                                <Input placeholder="Csr SubTitle"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'priceArchTitle']}
                                  label={'Price Archive Title'}
                              >
                                <Input placeholder="Price Archive Title"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'priceArchSubTitle']}
                                  label={'Price Archive SubTitle'}
                              >
                                <Input placeholder="Price Archive SubTitle"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'corpCervicesTitle']}
                                  label={'Corporate Services Title'}
                              >
                                <Input placeholder="Corporate Services Title"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'corpServicesSubTitle']}
                                  label={'Corporate Services SubTitle'}
                              >
                                <Input placeholder="Corporate Services SubTitle"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'corpServicesSubTitle2']}
                                  label={'Corporate Services SubTitle2'}
                              >
                                <Input placeholder="Corporate Services SubTitle2"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'hiTitle']}
                                  label={'Hi Title'}
                              >
                                <Input placeholder="Hi Title"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'hiSubTitle']}
                                  label={'Hi SubTitle'}
                              >
                                <Input placeholder="Hi SubTitle"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'peopleTitle']}
                                  label={'People Title'}
                              >
                                <Input placeholder="People Title"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'peopleSubTitle']}
                                  label={'People SubTitle'}
                              >
                                <Input placeholder="People SubTitle"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'latestNewsTitle']}
                                  label={'latest News Title'}
                              >
                                <Input placeholder="latest News Title"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'latestNewsSubTitle']}
                                  label={'latest News subTitle'}
                              >
                                <Input placeholder="latest News subTitle"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'stationsTitle']}
                                  label={'stations Title'}
                              >
                                <Input placeholder="stations Title"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'stationsSubTitle']}
                                  label={'stations SubTitle'}
                              >
                                <Input placeholder="stations SubTitle"/>
                              </Form.Item>
                              
                              <Form.Item
                                  name={[field.name, 'tenderTitle']}
                                  label={'Tender Title'}
                              >
                                <Input placeholder="Tender Title"/>
                              </Form.Item>
                    
                              <Form.Item
                                  name={[field.name, 'tenderSubTitle']}
                                  label={'Tender SubTitle'}
                              >
                                <Input placeholder="Tender SubTitle"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'tenderContactTitle']}
                                  label={'Tender Contact Title'}
                              >
                                <Input placeholder="Tender Contact Title"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'tenderContactSubTitle']}
                                  label={'Tender Contact SubTitle'}
                              >
                                <Input placeholder="Tender Contact SubTitle"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'noEnergyCardTitle']}
                                  label={'No Energy Card Title'}
                              >
                                <Input placeholder="No Energy Card Title"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'waymartTitle']}
                                  label={'waymart Title'}
                              >
                                <Input placeholder="waymart Title"/>
                              </Form.Item>

                              <Form.Item
                                  name={[field.name, 'waymartSubTitle']}
                                  label={'waymart SubTitle'}
                              >
                                <Input placeholder="waymart SubTitle"/>
                              </Form.Item>

                            </Card>
                        )
                      })}
                  </div>
                }}
              </Form.List>
              <div className={"grid col-span-2 grid-cols-1 md:grid-cols-2 gap-x-5"}>
                <div className={""}>
                  <Form.Item className={"mb-0"} name={'status'} label="status" valuePropName={"value"}>
                    <Radio.Group buttonStyle="solid">
                      <Radio.Button value={true}>active</Radio.Button>
                      <Radio.Button className={""} value={false}>disable</Radio.Button>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item
                      name={'mail'}
                      label={'Mail'}
                  >
                    <Input placeholder="Mail"/>
                  </Form.Item>

                  <Form.Item
                      name={'phone'}
                      label={'Phone'}
                  >
                    <Input placeholder="Phone"/>
                  </Form.Item>

                  <Form.Item
                      name={'tenderEmail'}
                      label={'Tender Email'}
                  >
                    <Input placeholder="Tender Email" />
                  </Form.Item>

                  <Form.Item
                      name={'tenderPhoneNumber'}
                      label={'Tender Phone Number'}
                  >
                    <Input placeholder="Tender Phone Number"/>
                  </Form.Item>

                  <Form.Item
                      name={'facebookLink'}
                      label={'Facebook Link'}
                  >
                    <Input placeholder="Facebook Link"/>
                  </Form.Item>

                  <Form.Item
                      name={'instagramLink'}
                      label={'Instagram Link'}
                  >
                    <Input placeholder="Instagram Link"/>
                  </Form.Item>

                  <Form.Item
                      name={'linkedinLink'}
                      label={'Linkedin Link'}
                  >
                    <Input placeholder="Linkedin Link"/>
                  </Form.Item>

                  <Form.Item
                      name={'youtubeLink'}
                      label={'Youtube Link'}
                  >
                    <Input placeholder="Youtube Link"/>
                  </Form.Item>

                  <Form.Item
                      name={'androidAppLink'}
                      label={'Android App Link'}
                  >
                    <Input placeholder="Android App Link"/>
                  </Form.Item>

                  <Form.Item
                      name={'iosAppLink'}
                      label={'Ios App Link'}
                  >
                    <Input placeholder="Ios App Link"/>
                  </Form.Item>

                  <Form.Item
                      name={'tiktokLink'}
                      label={'Tiktok Link'}
                  >
                    <Input placeholder="Tiktok Link"/>
                  </Form.Item>

                </div>
                <div className="">
                  <div>
                    {
                      dataInfoAdv?.map((item: any, i: number) => {
                        return (
                            <div key={item?.id} className="py-[10px]">
                              <SiteInfoAdvCard
                                  refetchCardsNewData={refetch}
                                  index={i + 1}
                                  data={item?.details?.[0]}
                                  id={item.id}
                              />
                            </div>
                        )
                      })
                    }
                  </div>

                  <div className="mt-6 ml-14 flex justify-center gap-x-4">
                    <Link href={`/site-info/add-info-adv`}>
                      <Button disabled={false} type="primary" className={"flex items-center gap-x-2"}>
                        Add Site Info
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className={"grid col-span-2"}>
                <Button className={"mt-4 w-min mx-auto px-20"} type={"primary"} htmlType={"submit"}>Submit</Button>
              </div>

            </Form>
            }
          </div>

        </div>
      </>
  );
}