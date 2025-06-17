import { useState } from "react";
import { compareStrings, removeBrandFromProduct } from "../util";
import { CSVLink } from "react-csv";

export default function SimpleDownload({ syndicationMatches, info, setInfo }) {
  const [selectedAlert, setSelectedAlert] = useState("amber");
  const [sortBy, setSortBy] = useState("");
  const [loading, setLoading] = useState();

  const csvHeaders = [
    { label: "Tesco TPNB", key: "pageId" },
    { label: "Tesco Product Name", key: "productName" },
    { label: "Tesco Brand", key: "displayBrandName" },
    { label: "Source Product Name", key: "syndicatingProductName" },
    { label: "Source Brand", key: "syndicatingBrandName" },
    { label: "Source Group", key: "syndicatingMerchantGroup" },
    { label: "Brand Check", key: "passedBrand" },
    { label: "Product Check", key: "productCheck" },
    { label: "Product Check Reason", key: "productCheckReason" },
  ];

  // unique product matches are retailerpageid<>brandpageid<>brandmerchantgroup
  const uniqueProductMatch = [];
  console.log("syndicationMatches: start");
  syndicationMatches.forEach((el) => {
    if (el.pageId === "") return;
    if (el.productName === "") {
      const maybeName = syndicationMatches.find(
        (s) => s.pageId === el.pageId && s.productName !== ""
      );
      if (maybeName) el.productName = maybeName.productName;
    }
    if (el.syndicatingProductName === "") {
      const maybeName = syndicationMatches.find(
        (s) =>
          s.syndicatingPageId === el.syndicatingPageId &&
          s.syndicatingMerchantGroup === el.syndicatingMerchantGroup &&
          s.productName !== ""
      );
      if (maybeName)
        el.syndicatingProductName = maybeName.syndicatingProductName;
    }

    // amber, undefined. green, probably fine. red, needs checking. verified, human.
    if (!el.syndicatingMerchantGroup) return console.log("wtf");

    if (
      compareStrings(
        removeBrandFromProduct(el.productName, el.displayBrandName),
        removeBrandFromProduct(
          el.syndicatingProductName,
          el.syndicatingBrandName
        )
      )
    ) {
      el.alert = "green";
    } else {
      el.alert = "amber";
    }
    if (
      compareStrings(el.displayBrandName, el.syndicatingBrandName) ||
      compareStrings(el.displayBrandName, el.syndicatingProductName) ||
      compareStrings(el.displayBrandName, el.syndicatingMerchantGroup) ||
      compareStrings(el.productName, el.syndicatingProductName) ||
      compareStrings(el.productName, el.syndicatingBrandName) ||
      compareStrings(el.productName, el.syndicatingMerchantGroup) ||
      compareStrings(el.brandName, el.syndicatingMerchantGroup) ||
      compareStrings(el.productName, el.syndicatingPageId)
    ) {
      el.passedBrand = "passed";
    } else {
      el.passedBrand = "failed";
    }
  });

  console.log("syndicationMatches: done");

  const filteredMatches = syndicationMatches.filter(
    (el) => el.alert === selectedAlert
  );

  const uniqueRows = [];

  filteredMatches.forEach((m, i) => {
    m.productCheck = "failed";
    m.productCheckReason = "missmatch";
    if (
      m.productName === "" ||
      m.syndicatingProductName === "" ||
      m.productName === "unknown" ||
      m.syndicatingProductName === "unknown"
    ) {
      m.productCheckReason = "missing data";
    }
    if (!uniqueRows.find((r) => r.pageId === m.pageId)) uniqueRows.push(m);
  });

  console.log(filteredMatches);

  const showDownload = uniqueRows.length > 0 ? true : false;

  return (
    <>
      {showDownload ? (
        <CSVLink data={uniqueRows} headers={csvHeaders}>
          Download
        </CSVLink>
      ) : (
        "Waiting for data"
      )}
    </>
  );
}
