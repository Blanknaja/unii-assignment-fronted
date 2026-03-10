"use client";
import { ReportService } from "@/service/report";
import { useEffect } from "react";
const Client = () => {
  const fetchAPI = async () => {
    try {
      const result = await ReportService.getReport({
        startDate: "2024-05-01",
        grades: ["A"],
      });
      console.log("Fetch result", result);
    } catch (error) {
      console.error("Fetch failed", error);
    }
  };

  useEffect(() => {
    fetchAPI();
  }, []);
  return (
    <div>
      <h1>Client</h1>
    </div>
  );
};

export default Client;
