"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Table,
  Input,
  Select,
  Button,
  Checkbox,
  Row,
  Col,
  Card,
  Tag,
  Tooltip,
  DatePicker,
  ConfigProvider,
  Space,
  Grid,
  message,
} from "antd";
import { SearchOutlined, ClearOutlined } from "@ant-design/icons";
import { ReportService } from "@/service/report";
import { ProductService } from "@/service/produc";
import { cleanReportPayload } from "@/lib/helper";

import dayjs from "dayjs";
import { ProductCategory } from "./constants/product";

const { useBreakpoint } = Grid;
const { RangePicker } = DatePicker;

export default function InventoryReportPage() {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    categoryId: "",
    subCategoryId: "",
    orderId: "",
    orderIdMatchType: "CONTAINS",
    minPrice: "",
    maxPrice: "",
    grades: [],
  });
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [tableData, setTableData] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [expandedRowKeys, setExpandedRowKeys] = useState<any>([]);

  const [showSplash, setShowSplash] = useState(true);
  const [fadeSplash, setFadeSplash] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();
  const screens = useBreakpoint();

  useEffect(() => {
    fetchCategories();
    fetchReport();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeSplash(true);
      setTimeout(() => {
        setShowSplash(false);
      }, 500);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const fetchReport = async (customFilters?: any) => {
    setLoading(true);
    setCurrentPage(1);
    setExpandedRowKeys([]);
    try {
      const isEvent = customFilters && customFilters.nativeEvent;
      const payloadToUse =
        customFilters && !isEvent ? { ...customFilters } : { ...filters };

      if (payloadToUse.minPrice !== "" && payloadToUse.maxPrice !== "") {
        if (Number(payloadToUse.minPrice) > Number(payloadToUse.maxPrice)) {
          messageApi.warning("Min price must be less than max price");
          setFilters((prev) => ({ ...prev, minPrice: "", maxPrice: "" }));
          return;
        }
      }

      if (payloadToUse.minPrice !== "") {
        payloadToUse.minPrice = Number(payloadToUse.minPrice);
      } else {
        delete payloadToUse.minPrice;
      }

      if (payloadToUse.maxPrice !== "") {
        payloadToUse.maxPrice = Number(payloadToUse.maxPrice);
      } else {
        delete payloadToUse.maxPrice;
      }

      const cleanPayloaded = cleanReportPayload(payloadToUse);

      const result = await ReportService.getReport(cleanPayloaded);

      setTableData(result.data || []);
    } catch (error) {
      console.error("fetchReport failed : ", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await ProductService.Category.getProductCategories();
      if (response?.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("fetchCategories failed : ", error);
    }
  };

  const columns = [
    {
      title: "หมวดหมู่",
      dataIndex: "categoryName",
      fixed: "left" as const,
      width: 100,
    },
    {
      title: "สินค้าย่อย",
      dataIndex: "subCategoryName",
      fixed: screens.sm ? ("left" as const) : undefined,
      width: 150,
    },
    {
      title: "ซื้อรวม (กก.)",
      render: (record: any) => record.buy.totalQty?.toLocaleString(),
      align: "right" as const,
    },
    {
      title: "ยอดซื้อ (บ.)",
      render: (record: any) => record.buy.totalAmount?.toLocaleString(),
      align: "right" as const,
    },
    {
      title: "ขายรวม (กก.)",
      render: (record: any) => record.sell.totalQty?.toLocaleString(),
      align: "right" as const,
    },
    {
      title: "ยอดขาย (บ.)",
      render: (record: any) => record.sell.totalAmount?.toLocaleString(),
      align: "right" as const,
    },
    {
      title: "จำนวนคงเหลือ (กก.)",
      align: "right" as const,
      render: (record: any) => {
        const qty = record.balance.qty;
        return (
          <span
            className={`font-bold ${qty < 0 ? "text-red-500" : qty > 0 ? "text-green-600" : "text-gray-500"}`}
          >
            {qty > 0 ? `+${qty?.toLocaleString()}` : qty?.toLocaleString()}
          </span>
        );
      },
    },
    {
      title: "เงินคงเหลือ (บ.)",
      align: "right" as const,
      render: (record: any) => {
        const amount = record.balance.amount;
        return (
          <span
            className={`font-bold ${amount < 0 ? "text-red-500" : amount > 0 ? "text-green-600" : "text-gray-500"}`}
          >
            {amount > 0
              ? `+${amount?.toLocaleString()}`
              : amount?.toLocaleString()}
          </span>
        );
      },
    },
  ];

  const categoryOptions = categories.map((cat) => ({
    value: cat.categoryId,
    label: `${cat.categoryId} - ${cat.categoryName}`,
  }));
  const selectedCategoryObj = categories.find(
    (cat) => cat.categoryId === filters.categoryId,
  );

  const subCategoryOptions = selectedCategoryObj
    ? selectedCategoryObj.subcategory.map((sub) => ({
        value: sub.subCategoryId,
        label: `${sub.subCategoryId} - ${sub.subCategoryName}`,
      }))
    : [];

  const handleDateRangeChange = (dates: any, dateStrings: [string, string]) => {
    setFilters((prev) => ({
      ...prev,
      startDate: dateStrings?.[0] || "",
      endDate: dateStrings?.[1] || "",
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      categoryId: value,
      subCategoryId: "",
    }));
  };

  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleClear = () => {
    const defaultFilters = {
      startDate: "",
      endDate: "",
      categoryId: "",
      subCategoryId: "",
      orderId: "",
      orderIdMatchType: "CONTAINS",
      minPrice: "",
      maxPrice: "",
      grades: [],
    };
    // setCurrentPage(1);
    setFilters(defaultFilters);
    setExpandedRowKeys([]);
    fetchReport(defaultFilters);
  };

  const expandedRowRender = (record: any) => {
    return (
      <div className="flex gap-4 p-4 bg-gray-50 border-y border-gray-200">
        {/* Buy Zone */}
        <div className="box-buy">
          <h4 className="font-bold text-green-700 mb-2">Buy</h4>
          <p className="mb-1">
            <strong>ช่วงราคา:</strong> {record.buy.minPrice} -{" "}
            {record.buy.maxPrice} บาท
          </p>
          <div className="mb-2">
            <strong>เกรด: </strong>
            {record.buy.grades.A > 0 && (
              <Tag className="!ml-1" color="green">
                A ({record.buy.grades.A?.toLocaleString()}) kg
              </Tag>
            )}
            {record.buy.grades.B > 0 && (
              <Tag className="!ml-1" color="blue">
                B ({record.buy.grades.B?.toLocaleString()}) kg
              </Tag>
            )}
            {record.buy.grades.C > 0 && (
              <Tag className="!ml-1" color="orange">
                C ({record.buy.grades.C?.toLocaleString()}) kg
              </Tag>
            )}
            {record.buy.grades.D > 0 && (
              <Tag className="!ml-1" color="red">
                D ({record.buy.grades.D?.toLocaleString()}) kg
              </Tag>
            )}
            {Object.values(record.buy.grades).every((v) => v === 0) && (
              <span>-</span>
            )}
          </div>

          <div className="text-sm text-gray-500 mt-2">
            <strong className="block mb-1">
              ออเดอร์ ({record.buy.orders.length}):
            </strong>
            <div className="flex flex-wrap gap-1">
              {record.buy.orders.length > 0 ? (
                record.buy.orders.map((o: any, index: number) => {
                  return (
                    <Tooltip
                      key={index}
                      title={`วันที่ทำรายการ: ${o.date}`}
                      placement="top"
                    >
                      <span className="badge-order">
                        {o.orderId}{" "}
                        <strong className="text-brand-primary text-[8px]">
                          ({o.price}฿)
                        </strong>
                      </span>
                    </Tooltip>
                  );
                })
              ) : (
                <span>-</span>
              )}
            </div>
          </div>
        </div>

        {/* Sell Zone */}
        <div className="box-sell">
          <h4 className="font-bold text-orange-700 mb-2">Sell</h4>
          <p className="mb-1">
            <strong>ช่วงราคา:</strong> {record.sell.minPrice} -{" "}
            {record.sell.maxPrice} บาท
          </p>
          <div className="mb-2">
            <strong>เกรด: </strong>
            {record.sell.grades.A > 0 && (
              <Tag className="!ml-1" color="green">
                A ({record.sell.grades.A?.toLocaleString()}) kg
              </Tag>
            )}
            {record.sell.grades.B > 0 && (
              <Tag className="!ml-1" color="blue">
                B ({record.sell.grades.B?.toLocaleString()}) kg
              </Tag>
            )}
            {record.sell.grades.C > 0 && (
              <Tag className="!ml-1" color="orange">
                C ({record.sell.grades.C?.toLocaleString()}) kg
              </Tag>
            )}
            {record.sell.grades.D > 0 && (
              <Tag className="!ml-1" color="red">
                D ({record.sell.grades.D?.toLocaleString()}) kg
              </Tag>
            )}
            {Object.values(record.sell.grades).every((v) => v === 0) && (
              <span>-</span>
            )}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            <strong className="block mb-1">
              ออเดอร์ ({record.sell.orders.length}):
            </strong>
            <div className="flex flex-wrap gap-1">
              {record.sell.orders.length > 0 ? (
                record.sell.orders.map((o: any, index: number) => {
                  return (
                    <Tooltip
                      key={index}
                      title={`วันที่ทำรายการ: ${o.date}`}
                      placement="top"
                    >
                      <span className="badge-order">
                        {o.orderId}{" "}
                        <strong className="text-brand-primary text-[8px]">
                          ({o.price}฿)
                        </strong>
                      </span>
                    </Tooltip>
                  );
                })
              ) : (
                <span>-</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#4534f0",
          borderRadius: 6,
        },
        components: {
          Table: {
            headerBg: "#4534f0",
            headerColor: "#ffffff",
            headerBorderRadius: 6,
            rowHoverBg: "rgba(180, 41, 150, 0.02)",
          },
        },
      }}
    >
      {/* Add context to fix Static function can not consume context like dynamic theme. Please use 'App' component instead */}
      {contextHolder}
      {showSplash && (
        <div
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-brand-primary text-white transition-opacity duration-500 ${
            fadeSplash ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <Image
            priority
            src="/image/logo_unii.png"
            alt="UNII Logo"
            width={160}
            height={160}
            className="w-40 h-auto mb-6 animate-pulse drop-shadow-2xl"
          />

          <div className="w-12 h-12 border-4 border-white/20 border-t-brand-secondary rounded-full animate-spin"></div>

          <p className="mt-4 text-sm font-light text-white/70 tracking-widest">
            loading...
          </p>
        </div>
      )}
      <div className="p-6 bg-gray-100 min-h-screen">
        <Card className="mb-6 shadow-sm">
          <h2 className="title-brand text-2xl font-bold">
            <SearchOutlined className="text-brand-primary" />
            ระบบสรุปยอดซื้อ–ขาย
          </h2>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} className="flex flex-col">
              <label className="block mb-1 text-gray-600">วันที่</label>
              <RangePicker
                className="w-full"
                value={[
                  filters.startDate ? dayjs(filters.startDate) : null,
                  filters.endDate ? dayjs(filters.endDate) : null,
                ]}
                onChange={handleDateRangeChange}
                format="YYYY-MM-DD"
                placeholder={["วันที่เริ่มต้น", "วันที่สิ้นสุด"]}
              />
            </Col>

            <Col xs={24} sm={12} md={8} className="flex flex-col">
              <label className="block mb-1 text-gray-600">หมวดหมู่หลัก</label>
              <Select
                className="w-full"
                placeholder="เลือกหมวดหมู่หลัก"
                allowClear
                value={filters.categoryId || undefined}
                onChange={handleCategoryChange}
                options={categoryOptions}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Col>

            <Col xs={24} sm={12} md={8} className="flex flex-col">
              <label className="block mb-1 text-gray-600">สินค้าย่อย</label>
              <Select
                className="w-full"
                placeholder="เลือกหมวดหมู่ย่อย"
                allowClear
                value={filters.subCategoryId || undefined}
                onChange={(v) => handleFilterChange("subCategoryId", v)}
                options={subCategoryOptions}
                disabled={!filters.categoryId}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Col>

            <Col xs={24} sm={12} md={8} className="flex flex-col">
              <label className="block mb-1 text-gray-600">
                ช่วงราคาออเดอร์ (บาท)
              </label>
              <div className="flex items-center gap-2 h-[32px]">
                <Input
                  min={0}
                  type="number"
                  placeholder="เริ่มต้น"
                  value={filters.minPrice}
                  onChange={(e) =>
                    handleFilterChange("minPrice", e.target.value)
                  }
                  onBlur={() => {
                    if (filters.minPrice !== "" && filters.maxPrice !== "") {
                      if (Number(filters.minPrice) > Number(filters.maxPrice)) {
                        messageApi.warning(
                          "minprice must be less than maxprice",
                        );
                        handleFilterChange("minPrice", "");
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") {
                      e.preventDefault();
                    }
                  }}
                  className="flex-1"
                />
                <span className="text-gray-400 font-bold">-</span>
                <Input
                  min={0}
                  type="number"
                  placeholder="สิ้นสุด"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handleFilterChange("maxPrice", e.target.value)
                  }
                  onBlur={() => {
                    if (filters.minPrice !== "" && filters.maxPrice !== "") {
                      if (Number(filters.maxPrice) < Number(filters.minPrice)) {
                        messageApi.warning(
                          "maxprice must be greater than minprice",
                        );
                        handleFilterChange("maxPrice", "");
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") {
                      e.preventDefault();
                    }
                  }}
                  className="flex-1"
                />
              </div>
            </Col>

            <Col xs={24} sm={12} md={8} className="flex flex-col">
              <label className="block mb-1 text-gray-600">เลขออเดอร์</label>
              <Space.Compact className="w-full">
                <Select
                  className="w-24 sm:w-32"
                  value={filters.orderIdMatchType}
                  onChange={(v) => handleFilterChange("orderIdMatchType", v)}
                  options={[
                    { value: "CONTAINS", label: "contains" },
                    { value: "EXACT", label: "exact" },
                  ]}
                />
                <Input
                  placeholder="uniixxx..."
                  value={filters.orderId}
                  onChange={(e) =>
                    handleFilterChange("orderId", e.target.value)
                  }
                />
              </Space.Compact>
            </Col>

            <Col xs={24} sm={12} md={8} className="flex flex-col">
              <label className="block mb-1 text-gray-600">เกรดสินค้า</label>
              <div className="h-[32px] flex items-center">
                <Checkbox.Group
                  options={["A", "B", "C", "D"]}
                  value={filters.grades}
                  onChange={(v) => handleFilterChange("grades", v)}
                />
              </div>
            </Col>

            <Col xs={24} sm={24} md={8} className="flex flex-col">
              <label className="hidden md:block mb-1 opacity-0 pointer-events-none">
                Action
              </label>
              <div className="flex items-center gap-2 mt-2 md:mt-0">
                <Button
                  className="flex-1 md:flex-none"
                  icon={<ClearOutlined />}
                  onClick={handleClear}
                >
                  ล้างค่า (Clear)
                </Button>
                <Button
                  className="flex-1 md:flex-none"
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={fetchReport}
                  loading={loading}
                >
                  ค้นหา (Search)
                </Button>
              </div>
            </Col>
          </Row>
        </Card>

        <Card className="shadow-sm overflow-hidden p-0">
          <Table
            columns={columns}
            dataSource={tableData}
            loading={loading}
            rowKey={(record) => `${record.categoryId}_${record.subCategoryId}`}
            expandable={{
              expandedRowRender,
              expandedRowKeys: expandedRowKeys,
              onExpandedRowsChange: (keys) => setExpandedRowKeys(keys),
            }}
            scroll={{ x: 1000 }}
            bordered
            pagination={{
              current: currentPage,
              pageSize: 10,
              onChange: (page) => setCurrentPage(page),
              showSizeChanger: false,
              showTotal: (total, range) =>
                `แสดง ${range[0]}-${range[1]} จากทั้งหมด ${total} รายการ`,
            }}
          />
        </Card>
      </div>
    </ConfigProvider>
  );
}
