import { useState } from "react";
import { compareStrings } from "../util";

export default function BrandChecking({ syndicationMatches, info, setInfo }) {
  const [selectedAlert, setSelectedAlert] = useState("amber");
  const [sortBy, setSortBy] = useState("");

  const uniqueBrandMerchantGroupMatch = [];

  syndicationMatches.forEach((el) => {
    if (el.pageId === "") return;

    const exists = uniqueBrandMerchantGroupMatch.find(
      (unique) =>
        unique.displayBrandName === el.displayBrandName &&
        unique.syndicatingMerchantGroup === el.syndicatingMerchantGroup &&
        unique.syndicatingBrandName === el.syndicatingBrandName
    );

    const newUnique = exists
      ? exists
      : {
          displayBrandName: el.displayBrandName,
          syndicatingMerchantGroup: el.syndicatingMerchantGroup,
          syndicatingBrandName: el.syndicatingBrandName,
          alert: "amber",
        };

    if (!exists) uniqueBrandMerchantGroupMatch.push(newUnique);

    // amber, undefined. green, probably fine. red, needs checking. verified, human.
    if (!el.syndicatingMerchantGroup) return;

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
      newUnique.alert = "green";
    } else {
      newUnique.alert = "amber";
    }
  });

  const counts = { red: 0, amber: 0, green: 0, verified: 0 };

  uniqueBrandMerchantGroupMatch.forEach((el) => {
    counts[el.alert]++;
  });

  const filteredMatches = uniqueBrandMerchantGroupMatch.filter(
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
            <button onClick={() => setSortBy("brand")}>Local Brand</button>
          </td>
          <td>
            <button onClick={() => setSortBy("brand")}>Syn Brand</button>
          </td>
          <td>
            <button onClick={() => setSortBy("mg")}>Syn MG</button>
          </td>
        </tr>
        {filteredMatches.map((match, k) => {
          return (
            <tr key={k}>
              <td>
                <span
                  style={{
                    color: "red",
                    backgroundColor:
                      info &&
                      match.syndicatingBrandName ===
                        info.syndicatingBrandName &&
                      match.displayBrandName === info.displayBrandName &&
                      match.syndicatingMerchantGroup ===
                        info.syndicatingMerchantGroup
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
                    setInfo({ ...match });
                  }}
                >
                  i
                </span>
              </td>
              <td>{match.displayBrandName}</td>
              <td>{match.syndicatingBrandName}</td>
              <td>{match.syndicatingMerchantGroup}</td>
            </tr>
          );
        })}
      </table>
    </>
  );
}
