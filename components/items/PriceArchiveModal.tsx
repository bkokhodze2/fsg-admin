import React from 'react'
import { axiosWithAuth } from "@/configs/axios";
import { Button, Card, DatePicker, Divider, Form, InputNumber, Modal, Space, notification } from 'antd'
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

const monthFormat = 'YYYY/MM';
  
  interface IProps {
    isPriceArchiveModalOpen: boolean,
    setIsPriceArchiveModalOpen: any,
    setTenderPricesArchiveData: any,
    tenderPricesArchiveData: any,
  }

const PriceArchiveModal = ({isPriceArchiveModalOpen, setIsPriceArchiveModalOpen, setTenderPricesArchiveData, tenderPricesArchiveData}: IProps) => {

  const [form] = Form.useForm();
  const Router = useRouter();

  const handleCancelPriceArchiveModal = () => {
    setIsPriceArchiveModalOpen(false);
    setTenderPricesArchiveData(null);
  };

  const onchange = (values: any, allValues: any) => {
    console.log("values", values)
    console.log("allValues", allValues)
  }
  
  const onFinish = async (values: any) => {
    console.log("form values", values)
    setIsPriceArchiveModalOpen(false);

    // Modify the form data here before submitting
    const modifiedValues = {
      ...values,
      tenderId: tenderPricesArchiveData?.tenderId,
      month: Number(values.month.format('YYYYMM')),
    };
    console.log("modifiedValues", modifiedValues)


    try {
      const res = await axiosWithAuth.post('/tender-editor/add-or-modify-tender-price-archive', modifiedValues)
      if (res.status == 200) {
        notification.open({
          type: 'success',
          message: `Tender was added`,
        });
        // isEditPage ? await refetch() : null;
        Router.push("/tenders")
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
    if (tenderPricesArchiveData) {
      console.log("dataTenderDetails", tenderPricesArchiveData)
      return {...tenderPricesArchiveData, month: dayjs(tenderPricesArchiveData.month?.toString(), 'YYYYMM'),};
    } else {
      return {
        "id": null,
        "month": null,
        "regDate": null,
        "tenderId": null,
        "servicePrice1": false,
        "servicePrice2": false,
        "servicePrice3": false,
        "servicePrice4": false,
        "servicePriceStatus1": false,
        "servicePriceStatus2": false,
        "servicePriceStatus3": false,
        "servicePriceStatus4": false,
      }
    }
  }

  const monthYear = tenderPricesArchiveData?.month?.toString()

  return (
    <Modal title="Basic Modal" open={isPriceArchiveModalOpen} footer={null} onCancel={handleCancelPriceArchiveModal}>
        {tenderPricesArchiveData &&
          <Form
            form={form}
            layout="vertical"
            onValuesChange={onchange}
            onFinish={onFinish}
            // size={'default' as SizeType}
            initialValues={getDefaultValue()}
          >

        <Form.Item
            className={"mb-0 py-[24px]"}
            name="month"
            label="Year/Month"
        >
            <DatePicker defaultValue={dayjs(`${monthYear?.slice(0, 4)}/${monthYear?.slice(4)}`, monthFormat)} format={monthFormat} picker="month" />
        </Form.Item>

        <Card
            key={1}
            className={"border-[1px] rounded-2xl border-solid border-[#b2b2b2]"}>
            <Divider orientation="left" className={"!my-0"}>
            <h3 className={"text-[25px]"}>Service Price 1</h3>
            </Divider>

            <Card className={"border-[1px] rounded-2xl border-solid border-[#b2b2b2] flex w-full card-item"}>
                <Form.Item
                    className="flex-1"
                    name={'servicePrice1'}
                    label={'Price'}
                >
                    <InputNumber disabled={!tenderPricesArchiveData?.servicePriceStatus1} required={tenderPricesArchiveData?.servicePriceStatus1} placeholder="Enter a number" className="w-full"/>
                </Form.Item>
            </Card>
        </Card>

        <Card
            key={2}
            className={"border-[1px] rounded-2xl border-solid border-[#b2b2b2] my-[24px]"}>
            <Divider orientation="left" className={"!my-0"}>
            <h3 className={"text-[25px]"}>Service Price 2</h3>
            </Divider>

            <Card className={"border-[1px] rounded-2xl border-solid border-[#b2b2b2] flex w-full card-item"}>
                <Form.Item
                    className="flex-1"
                    name={'servicePrice2'}
                    label={'Price'}
                >
                    <InputNumber placeholder="Enter a number" required={tenderPricesArchiveData?.servicePriceStatus2} disabled={!tenderPricesArchiveData?.servicePriceStatus2} className="w-full"/>
                </Form.Item>
            </Card>
        </Card>

        <Card
            key={3}
            className={"border-[1px] rounded-2xl border-solid border-[#b2b2b2]"}>
            <Divider orientation="left" className={"!my-0"}>
            <h3 className={"text-[25px]"}>Service Price 3</h3>
            </Divider>

            <Card className={"border-[1px] rounded-2xl border-solid border-[#b2b2b2] flex w-full card-item"}>
                <Form.Item
                    className="flex-1"
                    name={'servicePrice3'}
                    label={'Price'}
                >
                    <InputNumber placeholder="Enter a number" required={tenderPricesArchiveData?.servicePriceStatus3} disabled={!tenderPricesArchiveData.servicePriceStatus3} className="w-full"/>
                </Form.Item>
            </Card>
        </Card>

        <Card
            key={4}
            className={"border-[1px] rounded-2xl border-solid border-[#b2b2b2] my-[24px]"}>
            <Divider orientation="left" className={"!my-0"}>
            <h3 className={"text-[25px]"}>Service Price 4</h3>
            </Divider>

            <Card className={"border-[1px] rounded-2xl border-solid border-[#b2b2b2] flex w-full card-item"}>
                <Form.Item
                    className="flex-1"
                    name={'servicePrice4'}
                    label={'Price'}
                >
                    <InputNumber placeholder="Enter a number" required={tenderPricesArchiveData?.servicePriceStatus4} disabled={!tenderPricesArchiveData.servicePriceStatus4} className="w-full"/>
                </Form.Item>
            </Card>
        </Card>
            
        <div className='flex justify-end'>
            <Button className={"mt-4 mr-2"} type={"default"} onClick={handleCancelPriceArchiveModal}>Cancel</Button>
            <Button className={"mt-4"} type={"primary"} htmlType={"submit"}>Submit</Button>
        </div>

        </Form>
        }
      </Modal>
  )
}

export default PriceArchiveModal