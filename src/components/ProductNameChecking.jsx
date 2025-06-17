import { useState } from "react";
import { compareStrings, removeBrandFromProduct } from "../util";

export default function ProductNameChecking({
  syndicationMatches,
  info,
  setInfo,
}) {
  const [selectedAlert, setSelectedAlert] = useState("amber");
  const [sortBy, setSortBy] = useState("");

  // unique product matches are retailerpageid<>brandpageid<>brandmerchantgroup
  const uniqueProductMatch = [];

  syndicationMatches.forEach((el) => {
    if (el.pageId === "") return;

    const exists = uniqueProductMatch.find(
      (unique) =>
        unique.pageId === el.pageId &&
        unique.syndicatingMerchantGroup === el.syndicatingMerchantGroup &&
        unique.syndicatingPageId === el.syndicatingPageId
    );

    const newUnique = exists
      ? exists
      : {
          pageId: el.pageId,
          syndicatingMerchantGroup: el.syndicatingMerchantGroup,
          syndicatingPageId: el.syndicatingPageId,
          syndicatingBrandName: el.syndicatingBrandName,
          syndicatingMerchantGroup: el.syndicatingMerchantGroup,
          displayBrandName: el.displayBrandName,
          productName: el.productName,
          syndicatingProductName: el.syndicatingProductName,
          alert: "amber",
        };

    if (!exists) uniqueProductMatch.push(newUnique);

    // amber, undefined. green, probably fine. red, needs checking. verified, human.
    if (!el.syndicatingMerchantGroup) return;

    if (
      compareStrings(
        removeBrandFromProduct(el.productName, el.displayBrandName),
        removeBrandFromProduct(
          el.syndicatingProductName,
          el.syndicatingBrandName
        )
      )
    ) {
      newUnique.alert = "green";
    } else {
      newUnique.alert = "amber";
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
      newUnique.passedBrand = "passed";
    } else {
      newUnique.passedBrand = "failed";
    }
  });

  const counts = { red: 0, amber: 0, green: 0, verified: 0 };

  uniqueProductMatch.forEach((el) => {
    counts[el.alert]++;
  });

  const filteredMatches = uniqueProductMatch.filter(
    (el) => el.alert === selectedAlert
  );

  filteredMatches.sort((a, b) => {
    if (sortBy === "") {
      return a.syndicatingMerchantGroup > b.syndicatingMerchantGroup ? 1 : -1;
    }
  });

  filteredMatches.sort((a, b) => {
    if (sortBy === "mg") {
      return a.syndicatingMerchantGroup > b.syndicatingMerchantGroup ? 1 : -1;
    } else if (sortBy === "brand") {
      return a.displayBrandName > b.displayBrandName ? 1 : -1;
    }
  });

  console.log(filteredMatches);

  const displayRows = filteredMatches.map((match, k) => {
    return (
      <tr key={k}>
        <td>
          <span
            style={{
              color: "red",
              backgroundColor:
                info &&
                match.syndicatingBrandName === info.syndicatingBrandName &&
                match.displayBrandName === info.displayBrandName &&
                match.syndicatingMerchantGroup === info.syndicatingMerchantGroup
                  ? "orange"
                  : "white",
              borderRadius: "50%",
              height: "1rem",
              width: "1rem",
              display: "inline-block",
              lineHeight: "1rem",
              cursor: "pointer",
            }}
            onClick={() => {
              console.log({ ...match });
              setInfo({ ...match });
            }}
          >
            i
          </span>
        </td>
        <td>{match.pageId}</td>
        <td>{match.productName}</td>
        <td>{match.displayBrandName}</td>
        <td>{match.syndicatingPageId}</td>
        <td>{match.syndicatingProductName}</td>
        <td>{match.syndicatingBrandName}</td>
        <td>{match.syndicatingMerchantGroup}</td>
        <td>{match.passedBrand}</td>
      </tr>
    );
  });

  return (
    <>
      <div>
        <button
          onClick={() => setSelectedAlert("amber")}
          style={selectedAlert === "amber" ? { background: "blue" } : undefined}
        >
          Amber
        </button>
        <button
          onClick={() => setSelectedAlert("green")}
          style={selectedAlert === "green" ? { background: "blue" } : undefined}
        >
          Green
        </button>
      </div>
      <div style={{ padding: 20 }}>{filteredMatches.length} results</div>
      <table>
        <tr style={{ fontWeight: 700, fontSize: "1rem" }}>
          <td />
          <td>
            <button onClick={() => setSortBy("brand")}>Display Page ID</button>
          </td>
          <td>
            <button onClick={() => setSortBy("brand")}>Display Product</button>
          </td>
          <td>
            <button onClick={() => setSortBy("brand")}>Display Brand</button>
          </td>
          <td>
            <button onClick={() => setSortBy("brand")}>Syn Page ID</button>
          </td>
          <td>
            <button onClick={() => setSortBy("brand")}>Syn Product</button>
          </td>
          <td>
            <button onClick={() => setSortBy("brand")}>Syn Brand</button>
          </td>
          <td>
            <button onClick={() => setSortBy("mg")}>Syn MG</button>
          </td>
          <td>
            <button onClick={() => setSortBy("mg")}>Brand Check</button>
          </td>
        </tr>
        {displayRows}
      </table>
    </>
  );
}
