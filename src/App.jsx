import { useState } from "react";
import Papa from "papaparse";
import "./App.css";

function App() {
  const [syndicationMatches, setSyndicationMatches] = useState([]);
  const [groupBy, setGroupBy] = useState("syndicatingBrand");
  const [selectedAlert, setSelectedAlert] = useState("amber");
  const [sortBy, setSortBy] = useState("");
  const [info, setInfo] = useState(null);
  // {displayBrandName:{good: [], bad:[]}}

  const handleChangeFile = (e) => {
    const files = e.target.files;
    if (files) {
      Papa.parse(files[0], {
        header: true,
        transformHeader: function (h, i) {
          const headers = [
            "pageId",
            "productName",
            "displayBrandName",
            "displayCategoryName",
            "reviewsSyndicated",
            "syndicatingMerchantGroup",
            "syndicatingBrandName",
            "syndicatingCategoryName",
            "syndicatingPageId",
            "syndicatingProductName",
          ];
          return headers[i];
        },
        complete: function (results) {
          const data = results.data.slice(3);
          setSyndicationMatches(data);
        },
      });
    }
  };

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

  const filteredMerchantCount = [];

  filteredMatches.forEach((a) => {
    const exists = filteredMerchantCount.find(
      (m) => m.name === a.syndicatingMerchantGroup
    );
    if (exists) {
      exists.count++;
    } else {
      filteredMerchantCount.push({
        name: a.syndicatingMerchantGroup,
        count: 1,
      });
    }
  });

  filteredMatches.forEach((a) => {
    a.count = filteredMerchantCount.find(
      (m) => m.name === a.syndicatingMerchantGroup
    ).count;
  });

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
    } else {
      return a.count - b.count;
    }
  });

  return (
    <>
      <div className="section" style={{ flex: "none", paddingRight: 40 }}>
        <ol>
          <li>
            {" "}
            Download{" "}
            <a
              href="https://analytics.powerreviews.com/data-explorer/inbound_current_partners_product?date_range=LAST_6_MONTHS&table_columns=display_page_id,display_product_name,display_brand_name,display_category_name,reviews_syndicated,partner_name,syndicating_brand_name,syndicating_category_name,syndicating_page_id,syndicating_product_name&table_sort=reviews_syndicated_ninety_day_change%20desc"
              target="_blank"
            >
              this report
            </a>
            , CSV PIPE SEPARATED.
          </li>
          <li>
            Upload it:{" "}
            <input type="file" accept=".csv" onChange={handleChangeFile} />
          </li>
        </ol>

        <div>
          <button
            onClick={() => setSelectedAlert("amber")}
            style={
              selectedAlert === "amber" ? { background: "blue" } : undefined
            }
          >
            Amber
          </button>
          <button
            onClick={() => setSelectedAlert("green")}
            style={
              selectedAlert === "green" ? { background: "blue" } : undefined
            }
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
      </div>
      {info && (
        <Info
          info={syndicationMatches.filter(
            (match) =>
              match.displayBrandName === info.displayBrandName &&
              match.syndicatingMerchantGroup ===
                info.syndicatingMerchantGroup &&
              match.syndicatingBrandName === info.syndicatingBrandName
          )}
        />
      )}
    </>
  );
}

const Info = ({ info }) => {
  if (!info) return <div className="section"></div>;
  return (
    <div className="section" style={{ fontSize: "0.8rem" }}>
      {info.map((i, k) => (
        <InfoItem key={k} info={i} />
      ))}
    </div>
  );
};

const InfoItem = ({ info }) => {
  return (
    <ul>
      <li>
        <b>Page ID: </b>
        {info.pageId}
      </li>
      <li>
        <b>Product Name: </b>
        {info.productName}
      </li>
      <li>
        <b>Display Brand: </b>
        {info.displayBrandName}
      </li>
      <li>
        <b>Display Category: </b>
        {info.displayCategoryName}
      </li>
      <li>
        <b>Reviews Syndicated: </b>
        {info.reviewsSyndicated}
      </li>
      <li className="alert">
        <b>Syn Merchant G: </b>
        {info.syndicatingMerchantGroup}
      </li>
      <li className="alert">
        <b>Syn Brand Name: </b>
        {info.syndicatingBrandName}
      </li>
      <li className="alert">
        <b>Syn Product Name: </b>
        {info.syndicatingProductName}
      </li>
      <li className="alert">
        <b>Syn Page Id: </b>
        {info.syndicatingPageId}
      </li>
    </ul>
  );
};

const compareStrings = (stringA, stringB) => {
  if (!stringA || !stringB) return false;
  return wordMatch(stringA, stringB) || wordMatch(stringB, stringA);
};

const wordMatch = (stringA, stringB) => {
  const stringAWords = stringA.split(" ");
  const biggestStringAWord = stringAWords.reduce(
    (a, v) => (v.length > a.length ? v : a),
    stringAWords[0]
  );
  let stringAFilteredWords = stringAWords.filter((el) => el.length > 3);
  if (stringAFilteredWords.length === 0)
    stringAFilteredWords = [biggestStringAWord];

  for (let i = 0; i < stringAFilteredWords.length; i++) {
    if (stringB.toUpperCase().includes(stringAFilteredWords[i].toUpperCase()))
      return true;
  }

  return false;
};

export default App;
