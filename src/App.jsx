import { useState } from "react";
import Papa from "papaparse";
import "./App.css";
import BrandChecking from "./components/BrandChecking";
import ProductNameChecking from "./components/ProductNameChecking";
import SimpleDownload from "./components/SimpleDownload";

function App() {
  const [syndicationMatches, setSyndicationMatches] = useState([]);
  const [info, setInfo] = useState(null);
  // {displayBrandName:{good: [], bad:[]}}

  const handleChangeFile = (e) => {
    console.log("changefile: start");
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
          console.log("changefile: done");
        },
      });
    }
  };

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
        <SimpleDownload
          syndicationMatches={syndicationMatches}
          info={info}
          setInfo={setInfo}
        />{" "}
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

export default App;
