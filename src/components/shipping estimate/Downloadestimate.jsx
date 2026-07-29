import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { MdDownloadForOffline } from "react-icons/md";
import { usePDF } from "react-to-pdf";
import logo from "../../Assests/logo.png";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRef } from "react";

const VAT_OPTIONS = [
  { value: "", label: "No Vat" },
  { value: "Standard Rate(15.00%)", label: "Standard Rate (15.00 %)" },
  { value: "Standard Rate (Capital Goods) (15.00%)", label: "Standard Rate (Capital Goods) (15.00 %)" },
  { value: "Zero Rate", label: "Zero Rate (0.00 %)" },
  { value: "Zero Rate Exports(0.00%)", label: "Zero Rate Exports (0.00 %)" },
  { value: "Exempt and Non-Suppliers(0.00%)", label: "Exempt and Non-Suppliers (0.00 %)" },
  { value: "Export of Second Hands Goods(15.00%)", label: "Export of Second Hands Goods (15.00 %)" },
  { value: "Change in Use(15.00%)", label: "Change in Use (15.00 %)" },
  { value: "Customs VAT(100.00%)", label: "Customs VAT (100.00 %)" },
  { value: "Goods and Services Imported(100.00%)", label: "Goods and Services Imported (100.00 %)" },
  { value: "Capital Goods and Imported(100.00%)", label: "Capital Goods and Imported (100.00 %)" },
  { value: "VAT Adjustment (100.00%)", label: "VAT Adjustment (100.00 %)" },
  { value: "Domestic Reverse Charge (15.00%)", label: "Domestic Reverse Charge (15.00 %)" },
  { value: "Manual VAT", label: "Manual VAT" },
  { value: "Manual VAT (Capital Goods)", label: "Manual VAT (Capital Goods)" }
];

const cleanParseFloat = (val) => {
  if (val === null || val === undefined || val === "") return 0;
  const cleaned = String(val).replace(/,/g, '').replace(/%/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

const formatValue = (val, dec = 2, isPercent = false) => {
  if (val === null || val === undefined || val === "") {
    return isPercent ? "0.00 %" : "0.00";
  }
  const cleanVal = String(val).replace(/,/g, '').replace(/%/g, '').trim();
  const num = parseFloat(cleanVal);
  if (isNaN(num)) {
    return val;
  }
  const formatted = num.toLocaleString("en-US", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec
  });
  return isPercent ? `${formatted} %` : formatted;
};

const getVatPercent = (vatTyp) => {
  if (!vatTyp) return 0;
  if (!isNaN(vatTyp) && !isNaN(parseFloat(vatTyp))) {
    return parseFloat(vatTyp);
  }
  const match = String(vatTyp).match(/(\d+(?:\.\d+)?)\s*%/);
  if (match) {
    return parseFloat(match[1]);
  }
  return 0;
};

const getVatLabel = (val) => {
  if (!val) return "";
  if (String(val) === "15") return "Standard Rate(15.00%)";
  if (String(val) === "100") return "Customs VAT(100.00%)";
  if (String(val) === "0") return "Zero Rate";
  return val;
};

// ── Terms & Conditions content ──────────────────────────────────────────────
// Kept as plain data (not JSX) on purpose: today it's a hard-coded default,
// but the shape below (intro string + numbered {label, text} items) is exactly
// what an admin-configurable / API-driven terms list would look like too.
// To make this dynamic later: fetch this same shape from the backend and feed
// it into the `termsAndConditions` state below — no changes needed to the
// rendering or PDF logic.

const DEFAULT_TERMS_AND_CONDITIONS = {
  intro:
    "All business is undertaken subject to our General Trading Conditions, a copy of which is available on request. (E&OE) Errors and Omissions Excepted.",
  items: [
    {
      label: "Insurance",
      text: "All goods are shipped at the customer's risk. If insurance is required, it must be arranged and paid for by the customer.",
    },
    {
      label: "Weight and Dimensions",
      text: "Changes in the actual weight, dimensions of the goods from the initial quote may affect the final pricing at billing. The customer will be notified of any price adjustments.",
    },
    {
      label: "Misdeclaration of Goods",
      text: "Any misdeclaration of goods will result in additional charges and potential legal consequences. Misdeclaration may include cargo description, costs, hazardous e.t.c.",
    },
    {
      label: "Customs Duties & VAT",
      text: "The customer is responsible for all customs duties and VAT applicable to their shipment.",
    },
    {
      label: "Customs Stops & Inspections",
      text: "Any costs incurred due to customs stops and inspections will be billed to the customer.",
    },
    {
      label: "Late Collection & Storage Fees",
      text: "Goods not collected within the agreed timeframe will incur storage fees. These fees are payable by the customer.",
    },
    {
      label: "Late Payment of Invoices",
      text: "Late payment of invoices will attract interest charges as per the company's policy.",
    },
    {
      label: "Abandoned Cargo",
      text: "Cargo not collected within 28 days will be regarded abandoned, the customer will be liable for any disposal costs and associated fees.",
    },
  ],
};

const mapEstimateComponentsToFlatFields = (freight) => {
  if (!freight || typeof freight !== "object" || Array.isArray(freight)) {
    return freight;
  }
  if (!freight.components || !Array.isArray(freight.components)) {
    return freight;
  }
  const f = { ...freight };
  f.chargable_rate = f.chargable_rate || f.chargeable || f.chargeable_rate || 0;

  const filledOriginSlots = { pickup: false, fuel: false, cfs: false, doc: false, forwarding: false, customs: false };
  const filledFreightSlots = { freight: false, insurance: false };
  const filledTransitSlots = { thc: false, unpack: false, thirdparty: false, admin: false, port: false, advise: false, doc: false, base: false };
  const filledDestinationSlots = { thc: false, unpack: false, fuelsurcharge: false, admin: false, port: false, advise: false, thirdparty: false, delivery: false, fuelcharge: false, base: false };
  const filledAdminSlots = { disbursement: false, doc: false, base: false };

  const unmappedComponents = [];

  // Pass 1: Keyword-based mapping
  f.components.forEach((c) => {
    const desc = String(c.description || c.component_description || "").toLowerCase();
    const name = String(c.name || "").toLowerCase();
    let mapped = false;

    if (name.includes("origin")) {
      if ((desc.includes("pick") || desc.includes("up") || desc.includes("fee")) && !filledOriginSlots.pickup) {
        f.freight_charge_currencyQTY = c.qty;
        f.origin_pick_up_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.origin_pick_up_cost = c.cost;
        f.pickup_freight_currency = c.currency;
        f.roe_origin_currencyorigin = c.roe;
        f.org_pickUp_vatTyp = c.vat_type;
        f["org_pickUp_disc%"] = c.disc_percent;
        f.origin_pick_up_comment = c.comment;
        filledOriginSlots.pickup = true;
        mapped = true;
      } else if (desc.includes("fuel") && !filledOriginSlots.fuel) {
        f.origin_pick_up_fuel_unitTypeQTY = c.qty;
        f.origin_pick_up_fuel_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.origin_pick_up_fuel_cost = c.cost;
        f.roe_origin_fuel_currency = c.roe;
        f.origin_pick_up_fuel_comment = c.comment;
        filledOriginSlots.fuel = true;
        mapped = true;
      } else if ((desc.includes("cfs") || desc.includes("landside")) && !filledOriginSlots.cfs) {
        f.origin_pick_up_cfs_unitTypeQTY = c.qty;
        f.origin_pick_up_cfs_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.origin_pick_up_cfs_cost = c.cost;
        f.roe_origin_cfs_currency = c.roe;
        f.origin_pick_up_cfs_comment = c.comment;
        filledOriginSlots.cfs = true;
        mapped = true;
      } else if (desc.includes("doc") && !filledOriginSlots.doc) {
        f.origin_pick_up_documantation_unitTypeQTY = c.qty;
        f.origin_pick_up_documantation_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.origin_pick_up_documantion_cost = c.cost;
        f.roe_origin_doc_currency = c.roe;
        f.origin_pick_up_documantation_comment = c.comment;
        filledOriginSlots.doc = true;
        mapped = true;
      } else if ((desc.includes("forward") || desc.includes("foreward")) && !filledOriginSlots.forwarding) {
        f.origin_pick_up_forewarding_unitTypeQTY = c.qty;
        f.origin_pick_up_forewarding_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.origin_pick_up_forewarding_cost = c.cost;
        f.roe_origin_forewarding = c.roe;
        f.origin_pick_up_forewarding_comment = c.comment;
        filledOriginSlots.forwarding = true;
        mapped = true;
      } else if (desc.includes("custom") && !filledOriginSlots.customs) {
        f.origin_pick_up_custome_unitTypeQTY = c.qty;
        f.origin_pick_up_custome_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.origin_pick_up_custome_cost = c.cost;
        f.roe_origin_customes = c.roe;
        f.origin_pick_up_custome_comment = c.comment;
        filledOriginSlots.customs = true;
        mapped = true;
      }
    } else if (name.includes("freight")) {
      if (desc.includes("insurance") && !filledFreightSlots.insurance) {
        f.freight_currency_insurance_cost = c.cost;
        f.freight_currency_insurance_unittype = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.freight_currency_insurance_unittypeQTY = c.qty;
        f.freightorigin_insurance_gp = c.gp_percent;
        f.roe_insurance_currency = c.roe;
        f.freight_currency_insurance_comment = c.comment;
        filledFreightSlots.insurance = true;
        mapped = true;
      } else if (!desc.includes("insurance") && !filledFreightSlots.freight) {
        f.freight_charge_currency_cost = c.cost;
        f.freight_charge_currency_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.freight_charge_currency_unitTypeQTY = c.qty;
        f.freight_charge_currency_gp = c.gp_percent;
        f.roe_freight_currency = c.roe;
        f.freight_charge_currency = c.currency;
        f.ocenfreight_charge_vatTyp = c.vat_type;
        f["ocenfreight_charge_disc%"] = c.disc_percent;
        f.freight_charge_comment = c.comment;
        filledFreightSlots.freight = true;
        mapped = true;
      }
    } else if (name.includes("transit")) {
      if ((desc.includes("thc") || desc.includes("levy")) && !filledTransitSlots.thc) {
        f.transit_currency_THC_cost = c.cost;
        f.transit_currency_THC_initType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.transit_currency_THC_initTypeQTY = c.qty;
        f.transit_currency_THC_gp = c.gp_percent;
        f.roe_Transit_Thc = c.roe;
        f.transit_currency_THC_comment = c.comment;
        filledTransitSlots.thc = true;
        mapped = true;
      } else if (desc.includes("unpack") && !filledTransitSlots.unpack) {
        f.Transit_currency_unpack_cost = c.cost;
        f.Transit_currency_unpack_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.transit_currency_THC_initTypeeQTY = c.qty;
        f.Transit_currency_unpack_gp = c.gp_percent;
        f.Transit_unpack_roe = c.roe;
        f.Transit_currency_unpack_comment = c.comment;
        filledTransitSlots.unpack = true;
        mapped = true;
      } else if ((desc.includes("3rd") || desc.includes("party") || desc.includes("cfs")) && !filledTransitSlots.thirdparty) {
        f.transit_3rd_party_cost = c.cost;
        f.transit_3rd_party_unittype = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.transit_3rd_party_unittypeQTY = c.qty;
        f.transit_3rd_party_gp = c.gp_percent;
        f.transit_currency_3rd = c.roe;
        f.transit_3rd_party_comment = c.comment;
        filledTransitSlots.thirdparty = true;
        mapped = true;
      } else if (desc.includes("admin") && !filledTransitSlots.admin) {
        f.transit_admin_change = c.cost;
        f.transit_admin_unittype = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.transit_admin_unittypeQTY = c.qty;
        f.transit_admin_gp = c.gp_percent;
        f.roe_transit_admin = c.roe;
        f.transit_admin_comment = c.comment;
        filledTransitSlots.admin = true;
        mapped = true;
      } else if (desc.includes("port") && !filledTransitSlots.port) {
        f.transit_currency_port = c.cost;
        f.transit_currency_port_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.transit_currency_port_unitTypeQTY = c.qty;
        f.transit_currency_port_gp = c.gp_percent;
        f.roe_trans_port = c.roe;
        f.transit_currency_port_comment = c.comment;
        filledTransitSlots.port = true;
        mapped = true;
      } else if ((desc.includes("advise") || desc.includes("loadhouse")) && !filledTransitSlots.advise) {
        f.Transit_advanced_load = c.cost;
        f.Transit_advanced_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.Transit_advanced_unitTypeQTY = c.qty;
        f.Transit_advanced_gp = c.gp_percent;
        f.Transit_advanced_gp_roe = c.roe;
        f.Transit_advanced_comment = c.comment;
        filledTransitSlots.advise = true;
        mapped = true;
      } else if (desc.includes("doc") && !filledTransitSlots.doc) {
        f.transit_change_Documentation = c.cost;
        f.transit_change_Documentation_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.transit_change_Documentation_unitTypeQTY = c.qty;
        f.transit_change_Documentation_gp = c.gp_percent;
        f.roe_transit_change_Documentation = c.roe;
        f.transit_change_Documentation_comment = c.comment;
        filledTransitSlots.doc = true;
        mapped = true;
      } else if (!filledTransitSlots.base) {
        f.Transit_currency_Cost = c.cost;
        f.Transit_currency_unitTpe = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.Transit_currency_unitTpeQTY = c.qty;
        f.Transit_currency_gp = c.gp_percent;
        f.Transit_currency_roe = c.roe;
        f.Transit_currency = c.currency;
        f.trans_clear_fees_vatTyp = c.vat_type;
        f["trans_clear_fees_disc%"] = c.disc_percent;
        f.Transit_currency_comment = c.comment;
        filledTransitSlots.base = true;
        mapped = true;
      }
    } else if (name.includes("destination")) {
      if ((desc.includes("thc") || desc.includes("levy")) && !filledDestinationSlots.thc) {
        f.Destination_THC_currency_cost = c.cost;
        f.Destination_THC_currency_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.Destination_THC_currency_unitTypeQTY = c.qty;
        f.Destination_THC_currency_gp = c.gp_percent;
        f.Destination_THC_currency_Roe = c.roe;
        f.Destination_THC_currency_comment = c.comment;
        filledDestinationSlots.thc = true;
        mapped = true;
      } else if (desc.includes("unpack") && !filledDestinationSlots.unpack) {
        f.Destination_Unpack_currency_cost = c.cost;
        f.Destination_Unpack_currency_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.Destination_Unpack_currency_unitTypeQTY = c.qty;
        f.Destination_Unpack_currency_gp = c.gp_percent;
        f.Destination_Unpack_currency_roe = c.roe;
        f.Destination_Unpack_currency_comment = c.comment;
        filledDestinationSlots.unpack = true;
        mapped = true;
      } else if (desc.includes("fuel") && desc.includes("surcharge") && !filledDestinationSlots.fuelsurcharge) {
        f.Destination_fuelsurcharge_currency_cost = c.cost;
        f.Destination_fuelsurcharge_currency_typeUnit = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.Destination_fuelsurcharge_currency_typeUnitQTY = c.qty;
        f.Destination_fuelsurcharge_currency_gp = c.gp_percent;
        f.Destination_fuelsurcharge_currency_roe = c.roe;
        f.Destination_fuelsurcharge_currency_comment = c.comment;
        filledDestinationSlots.fuelsurcharge = true;
        mapped = true;
      } else if (desc.includes("admin") && !filledDestinationSlots.admin) {
        f.Destination_adminsurcharge_currency_cost = c.cost;
        f.Destination_adminsurcharge_currency_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.Destination_adminsurcharge_currency_unitTypeQTY = c.qty;
        f.Destination_adminsurcharge_currency_gp = c.gp_percent;
        f.Destination_adminsurcharge_currency_roe = c.roe;
        f.Destination_adminsurcharge_currency_comment = c.comment;
        filledDestinationSlots.admin = true;
        mapped = true;
      } else if (desc.includes("port") && !filledDestinationSlots.port) {
        f.Destination_portcargo_currency_cost = c.cost;
        f.Destination_portcargo_currency_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.Destination_portcargo_currency_unitTypeQTY = c.qty;
        f.Destination_portcargo_currency_gp = c.gp_percent;
        f.Destination_portcargo_currency_roe = c.roe;
        f.Destination_portcargo_currency_comment = c.comment;
        filledDestinationSlots.port = true;
        mapped = true;
      } else if ((desc.includes("advise") || desc.includes("loadhouse")) && !filledDestinationSlots.advise) {
        f.Destination_AdvancedLoad_currency_cost = c.cost;
        f.Destination_AdvancedLoad_currency_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.Destination_AdvancedLoad_currency_unitTypeQTY = c.qty;
        f.Destination_AdvancedLoad_currency_gp = c.gp_percent;
        f.Destination_AdvancedLoad_currency_roe = c.roe;
        f.Destination_AdvancedLoad_currency_comment = c.comment;
        filledDestinationSlots.advise = true;
        mapped = true;
      } else if ((desc.includes("3rd") || desc.includes("party") || desc.includes("cfs")) && !filledDestinationSlots.thirdparty) {
        f.Destination_3rdpartyDesc_currency_cost = c.cost;
        f.Destination_3rdpartyDesc_currency_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.Destination_3rdpartyDesc_currency_unitTypeQTY = c.qty;
        f.Destination_3rdpartyDesc_currency_gp = c.gp_percent;
        f.Destination_3rdpartyDesc_currency_roe = c.roe;
        f.Destination_3rdpartyDesc_currency_comment = c.comment;
        filledDestinationSlots.thirdparty = true;
        mapped = true;
      } else if (desc.includes("delivery") && !filledDestinationSlots.delivery) {
        f.Destination_delivery_currency_cost = c.cost;
        f.Destination_delivery_currency_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.Destination_delivery_currency_unitTypeQTY = c.qty;
        f.Destination_delivery_currency_gp = c.gp_percent;
        f.Destination_delivery_currency_roe = c.roe;
        f.Destination_delivery_currency_comment = c.comment;
        filledDestinationSlots.delivery = true;
        mapped = true;
      } else if (desc.includes("fuel") && desc.includes("charge") && !filledDestinationSlots.fuelcharge) {
        f.Destination_fuelcharge_currency_cost = c.cost;
        f.Destination_fuelcharge_currency_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.Destination_fuelcharge_currency_unitTypeQTY = c.qty;
        f.Destination_fuelcharge_currency_gp = c.gp_percent;
        f.Destination_fuelcharge_currency_roe = c.roe;
        f.Destination_fuelcharge_currency_comment = c.comment;
        filledDestinationSlots.fuelcharge = true;
        mapped = true;
      } else if (!filledDestinationSlots.base) {
        f.Destination_freight_currency_cost = c.cost;
        f.Destination_freight_currency_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.Destination_freight_currency_unitTypeQTY = c.qty;
        f.Destination_freight_currency_gp = c.gp_percent;
        f.Destination_freight_currency_Roe = c.roe;
        f.Destination_freight_currency = c.currency;
        f.dest_clearing_fees_vatTyp = c.vat_type;
        f["dest_clearing_fees_disc%"] = c.disc_percent;
        f.Destination_freight_currency_comment = c.comment;
        filledDestinationSlots.base = true;
        mapped = true;
      }
    } else if (name.includes("admin")) {
      if (desc.includes("disbursement") && !filledAdminSlots.disbursement) {
        f.Destination_disbursemant_currency_cost = c.cost;
        f.Destination_disbursemant_currency_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.Destination_disbursemant_currency_unitTypeQTY = c.qty;
        f.Destination_disbursemant_currency_gp = c.gp_percent;
        f.Destination_disbursemant_currency_roe = c.roe;
        f.Destination_disbursemant_comment = c.comment;
        filledAdminSlots.disbursement = true;
        mapped = true;
      } else if ((desc.includes("doc") || desc.includes("documentation")) && !filledAdminSlots.doc) {
        f.Destination_doc_currency_cost = c.cost;
        f.Destination_doc_currency_unittype = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.Destination_doc_currency_unittypeQTY = c.qty;
        f.Destination_doc_currency_gp = c.gp_percent;
        f.Destination_doc_currency_roe = c.roe;
        f.Destination_doc_comment = c.comment;
        filledAdminSlots.doc = true;
        mapped = true;
      } else if (!filledAdminSlots.base) {
        f.Destination_AdminAgrncy_currency_cost = c.cost;
        f.Destination_AdminAgrncy_currency_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.Destination_AdminAgrncy_currency_unitQTY = c.qty;
        f.Destination_AdminAgrncy_currency_gp = c.gp_percent;
        f.Destination_AdminAgrncy_currency_roe = c.roe;
        f.Destination_AdminAgrncy_description = c.description;
        f.admin_currency_charge = c.currency;
        f.admin_agencyFee_vatTyp = c.vat_type;
        f["admin_agencyFee_disc%"] = c.disc_percent;
        f.Destination_AdminAgrncy_comment = c.comment;
        filledAdminSlots.base = true;
        mapped = true;
      }
    } else if (name.includes("customs")) {
      f.cust_duty_cost = c.cost;
      f.cust_duty_unitTyp = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
      f.cust_duty_qty = c.qty;
      f.cust_duty_roe = c.roe;
      f.cust_duty_curr = c.currency;
      f.cust_duty_vatTyp = c.vat_type;
      f["cust_duty_disc%"] = c.disc_percent;
      f.cust_duty_comment = c.comment;
      f.cust_duty_description = c.description;
      mapped = true;
    }

    if (!mapped) {
      unmappedComponents.push(c);
    }
  });

  // Pass 2: Sequential fallback mapping for any unmapped components
  unmappedComponents.forEach((c) => {
    const name = String(c.name || "").toLowerCase();

    if (name.includes("origin")) {
      // Find first empty slot in Origin Charges
      if (!filledOriginSlots.pickup) {
        f.freight_charge_currencyQTY = c.qty;
        f.origin_pick_up_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.origin_pick_up_cost = c.cost;
        f.pickup_freight_currency = c.currency;
        f.roe_origin_currencyorigin = c.roe;
        f.org_pickUp_vatTyp = c.vat_type;
        f["org_pickUp_disc%"] = c.disc_percent;
        f.origin_pick_up_comment = c.comment;
        filledOriginSlots.pickup = true;
      } else if (!filledOriginSlots.fuel) {
        f.origin_pick_up_fuel_unitTypeQTY = c.qty;
        f.origin_pick_up_fuel_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.origin_pick_up_fuel_cost = c.cost;
        f.roe_origin_fuel_currency = c.roe;
        f.origin_pick_up_fuel_comment = c.comment;
        filledOriginSlots.fuel = true;
      } else if (!filledOriginSlots.cfs) {
        f.origin_pick_up_cfs_unitTypeQTY = c.qty;
        f.origin_pick_up_cfs_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.origin_pick_up_cfs_cost = c.cost;
        f.roe_origin_cfs_currency = c.roe;
        f.origin_pick_up_cfs_comment = c.comment;
        filledOriginSlots.cfs = true;
      } else if (!filledOriginSlots.doc) {
        f.origin_pick_up_documantation_unitTypeQTY = c.qty;
        f.origin_pick_up_documantation_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.origin_pick_up_documantion_cost = c.cost;
        f.roe_origin_doc_currency = c.roe;
        f.origin_pick_up_documantation_comment = c.comment;
        filledOriginSlots.doc = true;
      } else if (!filledOriginSlots.forwarding) {
        f.origin_pick_up_forewarding_unitTypeQTY = c.qty;
        f.origin_pick_up_forewarding_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.origin_pick_up_forewarding_cost = c.cost;
        f.roe_origin_forewarding = c.roe;
        f.origin_pick_up_forewarding_comment = c.comment;
        filledOriginSlots.forwarding = true;
      } else if (!filledOriginSlots.customs) {
        f.origin_pick_up_custome_unitTypeQTY = c.qty;
        f.origin_pick_up_custome_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.origin_pick_up_custome_cost = c.cost;
        f.roe_origin_customes = c.roe;
        f.origin_pick_up_custome_comment = c.comment;
        filledOriginSlots.customs = true;
      }
    } else if (name.includes("freight")) {
      if (!filledFreightSlots.freight) {
        f.freight_charge_currency_cost = c.cost;
        f.freight_charge_currency_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.freight_charge_currency_unitTypeQTY = c.qty;
        f.freight_charge_currency_gp = c.gp_percent;
        f.roe_freight_currency = c.roe;
        f.freight_charge_currency = c.currency;
        f.ocenfreight_charge_vatTyp = c.vat_type;
        f["ocenfreight_charge_disc%"] = c.disc_percent;
        f.freight_charge_comment = c.comment;
        filledFreightSlots.freight = true;
      } else if (!filledFreightSlots.insurance) {
        f.freight_currency_insurance_cost = c.cost;
        f.freight_currency_insurance_unittype = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.freight_currency_insurance_unittypeQTY = c.qty;
        f.freightorigin_insurance_gp = c.gp_percent;
        f.roe_insurance_currency = c.roe;
        f.freight_currency_insurance_comment = c.comment;
        filledFreightSlots.insurance = true;
      }
    } else if (name.includes("transit")) {
      if (!filledTransitSlots.thc) {
        f.transit_currency_THC_cost = c.cost;
        f.transit_currency_THC_initType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.transit_currency_THC_initTypeQTY = c.qty;
        f.transit_currency_THC_gp = c.gp_percent;
        f.roe_Transit_Thc = c.roe;
        f.transit_currency_THC_comment = c.comment;
        filledTransitSlots.thc = true;
      } else if (!filledTransitSlots.unpack) {
        f.Transit_currency_unpack_cost = c.cost;
        f.Transit_currency_unpack_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.transit_currency_THC_initTypeeQTY = c.qty;
        f.Transit_currency_unpack_gp = c.gp_percent;
        f.Transit_unpack_roe = c.roe;
        f.Transit_currency_unpack_comment = c.comment;
        filledTransitSlots.unpack = true;
      } else if (!filledTransitSlots.thirdparty) {
        f.transit_3rd_party_cost = c.cost;
        f.transit_3rd_party_unittype = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.transit_3rd_party_unittypeQTY = c.qty;
        f.transit_3rd_party_gp = c.gp_percent;
        f.transit_currency_3rd = c.roe;
        f.transit_3rd_party_comment = c.comment;
        filledTransitSlots.thirdparty = true;
      } else if (!filledTransitSlots.admin) {
        f.transit_admin_change = c.cost;
        f.transit_admin_unittype = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.transit_admin_unittypeQTY = c.qty;
        f.transit_admin_gp = c.gp_percent;
        f.roe_transit_admin = c.roe;
        f.transit_admin_comment = c.comment;
        filledTransitSlots.admin = true;
      } else if (!filledTransitSlots.port) {
        f.transit_currency_port = c.cost;
        f.transit_currency_port_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.transit_currency_port_unitTypeQTY = c.qty;
        f.transit_currency_port_gp = c.gp_percent;
        f.roe_trans_port = c.roe;
        f.transit_currency_port_comment = c.comment;
        filledTransitSlots.port = true;
      } else if (!filledTransitSlots.advise) {
        f.Transit_advanced_load = c.cost;
        f.Transit_advanced_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.Transit_advanced_unitTypeQTY = c.qty;
        f.Transit_advanced_gp = c.gp_percent;
        f.Transit_advanced_gp_roe = c.roe;
        f.Transit_advanced_comment = c.comment;
        filledTransitSlots.advise = true;
      } else if (!filledTransitSlots.doc) {
        f.transit_change_Documentation = c.cost;
        f.transit_change_Documentation_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.transit_change_Documentation_unitTypeQTY = c.qty;
        f.transit_change_Documentation_gp = c.gp_percent;
        f.roe_transit_change_Documentation = c.roe;
        f.transit_change_Documentation_comment = c.comment;
        filledTransitSlots.doc = true;
      } else if (!filledTransitSlots.base) {
        f.Transit_currency_Cost = c.cost;
        f.Transit_currency_unitTpe = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.Transit_currency_unitTpeQTY = c.qty;
        f.Transit_currency_gp = c.gp_percent;
        f.Transit_currency_roe = c.roe;
        f.Transit_currency = c.currency;
        f.trans_clear_fees_vatTyp = c.vat_type;
        f["trans_clear_fees_disc%"] = c.disc_percent;
        f.Transit_currency_comment = c.comment;
        filledTransitSlots.base = true;
      }
    } else if (name.includes("destination")) {
      if (!filledDestinationSlots.thc) {
        f.Destination_THC_currency_cost = c.cost;
        f.Destination_THC_currency_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.Destination_THC_currency_unitTypeQTY = c.qty;
        f.Destination_THC_currency_gp = c.gp_percent;
        f.Destination_THC_currency_Roe = c.roe;
        f.Destination_THC_currency_comment = c.comment;
        filledDestinationSlots.thc = true;
      } else if (!filledDestinationSlots.unpack) {
        f.Destination_Unpack_currency_cost = c.cost;
        f.Destination_Unpack_currency_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.Destination_Unpack_currency_unitTypeQTY = c.qty;
        f.Destination_Unpack_currency_gp = c.gp_percent;
        f.Destination_Unpack_currency_roe = c.roe;
        f.Destination_Unpack_currency_comment = c.comment;
        filledDestinationSlots.unpack = true;
      } else if (!filledDestinationSlots.fuelsurcharge) {
        f.Destination_fuelsurcharge_currency_cost = c.cost;
        f.Destination_fuelsurcharge_currency_typeUnit = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.Destination_fuelsurcharge_currency_typeUnitQTY = c.qty;
        f.Destination_fuelsurcharge_currency_gp = c.gp_percent;
        f.Destination_fuelsurcharge_currency_roe = c.roe;
        f.Destination_fuelsurcharge_currency_comment = c.comment;
        filledDestinationSlots.fuelsurcharge = true;
      } else if (!filledDestinationSlots.admin) {
        f.Destination_adminsurcharge_currency_cost = c.cost;
        f.Destination_adminsurcharge_currency_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.Destination_adminsurcharge_currency_unitTypeQTY = c.qty;
        f.Destination_adminsurcharge_currency_gp = c.gp_percent;
        f.Destination_adminsurcharge_currency_roe = c.roe;
        f.Destination_adminsurcharge_currency_comment = c.comment;
        filledDestinationSlots.admin = true;
      } else if (!filledDestinationSlots.port) {
        f.Destination_portcargo_currency_cost = c.cost;
        f.Destination_portcargo_currency_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.Destination_portcargo_currency_unitTypeQTY = c.qty;
        f.Destination_portcargo_currency_gp = c.gp_percent;
        f.Destination_portcargo_currency_roe = c.roe;
        f.Destination_portcargo_currency_comment = c.comment;
        filledDestinationSlots.port = true;
      } else if (!filledDestinationSlots.advise) {
        f.Destination_AdvancedLoad_currency_cost = c.cost;
        f.Destination_AdvancedLoad_currency_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.Destination_AdvancedLoad_currency_unitTypeQTY = c.qty;
        f.Destination_AdvancedLoad_currency_gp = c.gp_percent;
        f.Destination_AdvancedLoad_currency_roe = c.roe;
        f.Destination_AdvancedLoad_currency_comment = c.comment;
        filledDestinationSlots.advise = true;
      } else if (!filledDestinationSlots.thirdparty) {
        f.Destination_3rdpartyDesc_currency_cost = c.cost;
        f.Destination_3rdpartyDesc_currency_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.Destination_3rdpartyDesc_currency_unitTypeQTY = c.qty;
        f.Destination_3rdpartyDesc_currency_gp = c.gp_percent;
        f.Destination_3rdpartyDesc_currency_roe = c.roe;
        f.Destination_3rdpartyDesc_currency_comment = c.comment;
        filledDestinationSlots.thirdparty = true;
      } else if (!filledDestinationSlots.delivery) {
        f.Destination_delivery_currency_cost = c.cost;
        f.Destination_delivery_currency_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.Destination_delivery_currency_unitTypeQTY = c.qty;
        f.Destination_delivery_currency_gp = c.gp_percent;
        f.Destination_delivery_currency_roe = c.roe;
        f.Destination_delivery_currency_comment = c.comment;
        filledDestinationSlots.delivery = true;
      } else if (!filledDestinationSlots.fuelcharge) {
        f.Destination_fuelcharge_currency_cost = c.cost;
        f.Destination_fuelcharge_currency_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.Destination_fuelcharge_currency_unitTypeQTY = c.qty;
        f.Destination_fuelcharge_currency_gp = c.gp_percent;
        f.Destination_fuelcharge_currency_roe = c.roe;
        f.Destination_fuelcharge_currency_comment = c.comment;
        filledDestinationSlots.fuelcharge = true;
      } else if (!filledDestinationSlots.base) {
        f.Destination_freight_currency_cost = c.cost;
        f.Destination_freight_currency_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.Destination_freight_currency_unitTypeQTY = c.qty;
        f.Destination_freight_currency_gp = c.gp_percent;
        f.Destination_freight_currency_Roe = c.roe;
        f.Destination_freight_currency = c.currency;
        f.dest_clearing_fees_vatTyp = c.vat_type;
        f["dest_clearing_fees_disc%"] = c.disc_percent;
        f.Destination_freight_currency_comment = c.comment;
        filledDestinationSlots.base = true;
      }
    } else if (name.includes("admin")) {
      if (!filledAdminSlots.disbursement) {
        f.Destination_disbursemant_currency_cost = c.cost;
        f.Destination_disbursemant_currency_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.Destination_disbursemant_currency_unitTypeQTY = c.qty;
        f.Destination_disbursemant_currency_gp = c.gp_percent;
        f.Destination_disbursemant_currency_roe = c.roe;
        f.Destination_disbursemant_comment = c.comment;
        filledAdminSlots.disbursement = true;
      } else if (!filledAdminSlots.doc) {
        f.Destination_doc_currency_cost = c.cost;
        f.Destination_doc_currency_unittype = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.Destination_doc_currency_unittypeQTY = c.qty;
        f.Destination_doc_currency_gp = c.gp_percent;
        f.Destination_doc_currency_roe = c.roe;
        f.Destination_doc_comment = c.comment;
        filledAdminSlots.doc = true;
      } else if (!filledAdminSlots.base) {
        f.Destination_AdminAgrncy_currency_cost = c.cost;
        f.Destination_AdminAgrncy_currency_unitType = c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "");
        f.Destination_AdminAgrncy_currency_unitQTY = c.qty;
        f.Destination_AdminAgrncy_currency_gp = c.gp_percent;
        f.Destination_AdminAgrncy_currency_roe = c.roe;
        f.Destination_AdminAgrncy_description = c.description;
        f.admin_currency_charge = c.currency;
        f.admin_agencyFee_vatTyp = c.vat_type;
        f["admin_agencyFee_disc%"] = c.disc_percent;
        f.Destination_AdminAgrncy_comment = c.comment;
        filledAdminSlots.base = true;
      }
    }
  });

  return f;
};

export default function Downlaodestimate() {
  const [update, setUpdate] = useState([0]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [freight, setFreight] = useState(
    location?.state?.freight
      ? mapEstimateComponentsToFlatFields(location?.state?.freight)
      : mapEstimateComponentsToFlatFields(location?.state?.data) || [0]
  );
  const [origin, setOrigin] = useState([0]);
  const [showData, setShowData] = useState(true);
  const pdfRef = useRef();
  const [client, setClient] = useState([]);
  const [suppluierquot, setSuppluierquot] = useState([]);
  const [supplierdata, setSupplierdata] = useState([]);
  const [getdata, setGetdata] = useState([]);
  const [dat, setDat] = useState([]);
  const [openmodal, setOpenmodal] = useState(false);
  const [selected, setSelected] = useState([]); // selected IDs
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // TODO (future): replace this default with data fetched from the backend
  // (e.g. an admin-managed "terms & conditions" endpoint) — just call
  // setTermsAndConditions with the same { intro, items: [{ label, text }] }
  // shape and everything below (HTML render + PDF export) keeps working.
  const [termsAndConditions, setTermsAndConditions] = useState(DEFAULT_TERMS_AND_CONDITIONS);

  // Dynamic Rows for each section
  const [originRows, setOriginRows] = useState([]);
  const [freightRows, setFreightRows] = useState([]);
  const [transitRows, setTransitRows] = useState([]);
  const [destinationRows, setDestinationRows] = useState([]);
  const [adminRows, setAdminRows] = useState([]);
  const [customsRows, setCustomsRows] = useState([]);

  const resolveRowUnit = (unitType) => {
    if (!unitType || unitType === "Select") return 0;
    if (String(unitType) === "1") return 1;
    const rate = cleanParseFloat(freight?.chargable_rate);
    return rate;
  };

  const displayRowUnit = (unitType) => {
    if (!unitType || unitType === "Select") return "";
    if (String(unitType) === "1") return "1.000";
    return formatValue(freight?.chargable_rate, 3);
  };

  // Extract ONLY the percentage number (e.g. "15.00%") → returns 15
  const getPercentageOnly = (value) => {
    if (!value) return "";

    const cleanVal = String(value).replace(/,/g, '').replace(/%/g, '').trim();
    if (!isNaN(cleanVal) && !isNaN(parseFloat(cleanVal))) {
      return parseFloat(cleanVal).toFixed(2);
    }

    // Extract number from "Standard Rate(15.00%)", "15%", etc.
    const match = String(value).match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]).toFixed(2) : "";
  };

  const calculateRowData = (row) => {
    const qty = cleanParseFloat(row?.qty);
    const cost = cleanParseFloat(row?.cost);
    const unit = resolveRowUnit(row?.unitType);
    const tCost = (row?.unitType && row?.unitType !== "Select") ? (cost * unit * qty) : 0;

    const gpPercent = cleanParseFloat(row?.gp_percent);
    let salesPrice = tCost;
    if (gpPercent > 0 && gpPercent < 100) {
      salesPrice = tCost / (1 - gpPercent / 100);
    }

    const roe = cleanParseFloat(row?.roe);
    const finalAmt = salesPrice * roe;

    // === UPDATED: Extract only percentage number from text ===
    const discPercent = cleanParseFloat(getPercentageOnly(row?.discPercent));
    const vatPercent = cleanParseFloat(getPercentageOnly(row?.vatTyp));

    const disc = (finalAmt * discPercent) / 100;
    const exclusive = finalAmt - disc;

    let vat = (exclusive * vatPercent) / 100;

    // Keep manual VAT logic
    if (row?.vatTyp === "Manual VAT" || row?.vatTyp === "Manual VAT (Capital Goods)") {
      vat = cleanParseFloat(row?.vat);
    }

    const inclusive = exclusive + vat;

    return {
      unit,
      tCost,
      salesPrice,
      finalAmt,
      disc,
      exclusive,
      vat,
      inclusive
    };
  };

  const updateRowField = (setter, id, field, value) => {
    setter((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleBlur = (setter, id, field, value, dec = 2, isPercent = false) => {
    setter((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: formatValue(value, dec, isPercent) } : row
      )
    );
  };

  const handleFocus = (setter, id, field, value) => {
    setter((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
            ...row,
            [field]: String(value || "")
              .replace(/,/g, "")
              .replace(/%/g, "")
              .trim(),
          }
          : row
      )
    );
  };

  const loadEstimateData = (estimateData) => {
    if (!estimateData) return;

    setFreight(prev => ({
      ...prev,
      ...estimateData,
      supplier_id: estimateData.supplier_id || prev?.supplier_id || "",
      customer_invoice_no: estimateData.customer_invoice_no || prev?.customer_invoice_no || "",
      invoice_for_country: estimateData.invoice_for_country || prev?.invoice_for_country || "",
      final_base_currency: estimateData.final_base_currency || prev?.final_base_currency || "Select",
      chargable_rate: estimateData.chargeable ?? prev?.chargable_rate ?? "",
    }));

    if (estimateData.components && estimateData.components.length > 0) {
      const mappedComponents = estimateData.components.map(c => ({
        id: c.id,
        db_id: c.id,
        admin_frieght_component_id: c.admin_frieght_component_id,
        description: c.description || c.component_description || "",
        qty: c.qty !== null && c.qty !== undefined ? c.qty : "",
        currency: c.currency || "Select",
        cost: c.cost !== null && c.cost !== undefined ? formatValue(c.cost, 2) : "",
        unitType: c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "Select"),
        gp_percent: c.gp_percent !== null && c.gp_percent !== undefined ? c.gp_percent : "",
        sales_price: c.sales_price !== null && c.sales_price !== undefined ? formatValue(c.sales_price, 2) : "",
        roe: c.roe !== null && c.roe !== undefined ? formatValue(c.roe, 4) : "",
        vatTyp: c.vat_type !== null && c.vat_type !== undefined ? getVatLabel(c.vat_type) : "",
        vat: c.vat !== null && c.vat !== undefined ? formatValue(c.vat, 2) : "",
        discPercent: c.disc_percent !== null && c.disc_percent !== undefined ? formatValue(c.disc_percent, 2, true) : "",
        comment: c.comment || ""
      }));

      const origin = mappedComponents.filter(c => {
        const orig = estimateData.components.find(x => x.id === c.db_id);
        return orig && orig.name === "Origin Charges";
      });
      const freightC = mappedComponents.filter(c => {
        const orig = estimateData.components.find(x => x.id === c.db_id);
        return orig && orig.name === "Freight Charges";
      });
      const transit = mappedComponents.filter(c => {
        const orig = estimateData.components.find(x => x.id === c.db_id);
        return orig && orig.name === "Transit Charges";
      });
      const dest = mappedComponents.filter(c => {
        const orig = estimateData.components.find(x => x.id === c.db_id);
        return orig && orig.name === "Destination Charges";
      });
      const admin = mappedComponents.filter(c => {
        const orig = estimateData.components.find(x => x.id === c.db_id);
        return orig && orig.name === "Admin Charges";
      });
      const customs = mappedComponents.filter(c => {
        const orig = estimateData.components.find(x => x.id === c.db_id);
        return orig && orig.name === "Customs Charges";
      });

      setOriginRows(origin);
      setFreightRows(freightC);
      setTransitRows(transit);
      setDestinationRows(dest);
      setAdminRows(admin);
      setCustomsRows(customs);
    } else {
      const f = mapEstimateComponentsToFlatFields(estimateData);
      setOriginRows([
        {
          id: 1,
          description: f.origin_pick_up_description || "Origin Pick Up",
          qty: f.freight_charge_currencyQTY || "",
          currency: f.pickup_freight_currency || "Select",
          cost: (f.origin_pick_up_cost ?? "") !== "" ? formatValue(f.origin_pick_up_cost, 2) : "",
          unitType: f.origin_pick_up_unitType || "Select",
          gp_percent: "",
          sales_price: "",
          roe: (f.roe_origin_currencyorigin ?? "") !== "" ? formatValue(f.roe_origin_currencyorigin, 4) : "",
          vatTyp: getVatLabel(f.org_pickUp_vatTyp || ""),
          discPercent: (f["org_pickUp_disc%"] ?? "") !== "" ? formatValue(f["org_pickUp_disc%"], 2, true) : "",
          comment: f.origin_pick_up_comment || "",
        }
      ]);
      setFreightRows([
        {
          id: 2,
          description: f.freight_charge_description || "Freight Charges",
          qty: f.freight_charge_currency_unitTypeQTY || "",
          currency: f.freight_charge_currency || "Select",
          cost: (f.freight_charge_currency_cost ?? "") !== "" ? formatValue(f.freight_charge_currency_cost, 2) : "",
          unitType: f.freight_charge_currency_unitType || "Select",
          gp_percent: "",
          sales_price: "",
          roe: (f.roe_freight_currency ?? "") !== "" ? formatValue(f.roe_freight_currency, 4) : "",
          vatTyp: getVatLabel(f.ocenfreight_charge_vatTyp || ""),
          discPercent: (f["ocenfreight_charge_disc%"] ?? "") !== "" ? formatValue(f["ocenfreight_charge_disc%"], 2, true) : "",
          comment: f.freight_charge_comment || "",
        }
      ]);
      setTransitRows([
        {
          id: 3,
          description: f.Transit_currency_description || "Transit Charges",
          qty: f.Transit_currency_unitTpeQTY || "",
          currency: f.Transit_currency || "Select",
          cost: (f.Transit_currency_Cost ?? "") !== "" ? formatValue(f.Transit_currency_Cost, 2) : "",
          unitType: f.Transit_currency_unitTpe || "Select",
          gp_percent: "",
          sales_price: "",
          roe: (f.Transit_currency_roe ?? "") !== "" ? formatValue(f.Transit_currency_roe, 4) : "",
          vatTyp: getVatLabel(f.trans_clear_fees_vatTyp || ""),
          discPercent: (f["trans_clear_fees_disc%"] ?? "") !== "" ? formatValue(f["trans_clear_fees_disc%"], 2, true) : "",
          comment: f.Transit_currency_comment || "",
        }
      ]);
      setDestinationRows([
        {
          id: 4,
          description: f.Destination_freight_currency_description || "Destination Charges",
          qty: f.Destination_freight_currency_unitTypeQTY || "",
          currency: f.Destination_freight_currency || "Select",
          cost: (f.Destination_freight_currency_cost ?? "") !== "" ? formatValue(f.Destination_freight_currency_cost, 2) : "",
          unitType: f.Destination_freight_currency_unitType || "Select",
          gp_percent: "",
          sales_price: "",
          roe: (f.Destination_freight_currency_Roe ?? "") !== "" ? formatValue(f.Destination_freight_currency_Roe, 4) : "",
          vatTyp: getVatLabel(f.dest_clearing_fees_vatTyp || ""),
          discPercent: (f["dest_clearing_fees_disc%"] ?? "") !== "" ? formatValue(f["dest_clearing_fees_disc%"], 2, true) : "",
          comment: f.Destination_freight_currency_comment || "",
        }
      ]);
      setAdminRows([
        {
          id: 5,
          description: f.Destination_AdminAgrncy_description || "Admin Charges",
          qty: f.Destination_AdminAgrncy_currency_unitQTY || "",
          currency: f.admin_currency_charge || "Select",
          cost: (f.Destination_AdminAgrncy_currency_cost ?? "") !== "" ? formatValue(f.Destination_AdminAgrncy_currency_cost, 2) : "",
          unitType: f.Destination_AdminAgrncy_currency_unitType || "Select",
          gp_percent: "",
          sales_price: "",
          roe: (f.Destination_AdminAgrncy_currency_roe ?? "") !== "" ? formatValue(f.Destination_AdminAgrncy_currency_roe, 4) : "",
          vatTyp: getVatLabel(f.admin_agencyFee_vatTyp || ""),
          discPercent: (f["admin_agencyFee_disc%"] ?? "") !== "" ? formatValue(f["admin_agencyFee_disc%"], 2, true) : "",
          comment: f.Destination_AdminAgrncy_comment || "",
        }
      ]);
      setCustomsRows([
        {
          id: 6,
          description: f.cust_duty_description || "Customs Charges",
          qty: f.cust_duty_qty || "",
          currency: f.cust_duty_curr || "Select",
          cost: (f.cust_duty_cost ?? "") !== "" ? formatValue(f.cust_duty_cost, 2) : "",
          unitType: f.cust_duty_unitTyp || "Select",
          gp_percent: "",
          sales_price: "",
          roe: (f.cust_duty_roe ?? "") !== "" ? formatValue(f.cust_duty_roe, 4) : "",
          vatTyp: getVatLabel(f.cust_duty_vatTyp || ""),
          discPercent: (f["cust_duty_disc%"] ?? "") !== "" ? formatValue(f["cust_duty_disc%"], 2, true) : "",
          comment: f.cust_duty_comment || "",
        }
      ]);
    }
  };

  const renderRow = (row, calc, setter) => {
    return (
      <React.Fragment key={row.id}>
        <tr>
          <td>{row.description || ""}</td>
          <td>
            <input
              style={{ marginBottom: 0, fontSize: 13, color: "black", fontWeight: 400, border: "0px", verticalAlign: "middle" }}
              type="text"
              className="supplier_form"
              onChange={(e) => updateRowField(setter, row.id, "qty", e.target.value)}
              value={row.qty || ""}
              placeholder="0.00"
            />
          </td>
          <td>
            <select
              className="select_supplier"
              style={{ margin: 0, fontSize: 13, fontWeight: 700, paddingLeft: 5, border: 0 }}
              onChange={(e) => updateRowField(setter, row.id, "unitType", e.target.value)}
              value={row.unitType || "Select"}
            >
              <option value="Select">Select</option>
              <option value="1">L/S</option>
              <option value="2">W/M</option>
            </select>
          </td>
          <td>
            <input
              style={{ marginBottom: 0, fontSize: 13, color: "black", fontWeight: 400, border: "0px", verticalAlign: "middle" }}
              type="text"
              className="supplier_form"
              disabled
              value={displayRowUnit(row.unitType)}
              placeholder="0.00"
            />
          </td>
          <td>
            <input
              style={{ marginBottom: 0, fontSize: 13, color: "black", fontWeight: 400, border: "0px", verticalAlign: "middle" }}
              type="text"
              className="supplier_form"
              disabled
              value={formatValue(calc.salesPrice, 2)}
              placeholder="0.00"
            />
          </td>
          <td>
            <select
              className="select_supplier"
              style={{ margin: 0, fontSize: 13, fontWeight: 700, paddingLeft: 5, border: 0 }}
              onChange={(e) => updateRowField(setter, row.id, "currency", e.target.value)}
              value={row.currency || "Select"}
            >
              <option value="Select">Select</option>
              <option value="RAND">RAND</option>
              <option value="USD">USD</option>
              <option value="INR">INR</option>
              <option value="EURO">EURO</option>
            </select>
          </td>
          <td>
            <input
              style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }}
              name="roe"
              onChange={(e) => updateRowField(setter, row.id, "roe", e.target.value)}
              onBlur={(e) => handleBlur(setter, row.id, "roe", e.target.value, 4)}
              onFocus={(e) => handleFocus(setter, row.id, "roe", row.roe || "")}
              value={row.roe || ""}
              className="supplier_form"
            />
          </td>
          <td>
            <select
              className="select_supplier"
              style={{ margin: 0, fontSize: 13, fontWeight: 700, paddingLeft: 5, border: 0 }}
              onChange={(e) => updateRowField(setter, row.id, "vatTyp", e.target.value)}
              value={row.vatTyp || ""}
            >
              {VAT_OPTIONS.map((opt, i) => (
                <option key={i} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </td>
          <td>
            <input
              style={{ marginBottom: 0, fontSize: 13, color: "black", width: "50px", border: "0px", verticalAlign: "middle" }}
              type="text"
              onChange={(e) => updateRowField(setter, row.id, "discPercent", e.target.value)}
              onBlur={(e) => handleBlur(setter, row.id, "discPercent", e.target.value, 2, true)}
              onFocus={(e) => handleFocus(setter, row.id, "discPercent", row.discPercent || "")}
              value={row.discPercent || ""}
              placeholder="0.00%"
            />
          </td>
          <td>
            <input
              style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }}
              disabled
              value={formatValue(calc.exclusive)}
              className="supplier_form"
            />
          </td>
          <td>
            <input
              style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }}
              disabled
              value={formatValue(calc.inclusive)}
              className="supplier_form"
            />
          </td>
        </tr>
        {row.comment && (
          <tr className="comment-row">
            <td colSpan={11} style={{ textAlign: "left", fontSize: "12px", color: "#6c757d", fontStyle: "italic", padding: "4px 8px 4px 15px", borderTop: "none" }}>
              Comment: {row.comment}
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  const getdata122 = location?.state?.data || {};
  console.log(getdata122?.data);
  console.log(getdata122);

  // Save key IDs to localStorage if present in state to persist through page refresh
  if (getdata122?.freight_id) {
    localStorage.setItem("freightid", getdata122.freight_id);
  } else if (getdata122?.id) {
    localStorage.setItem("freightid", getdata122.id);
  }
  const initialQuoteEstimateId = getdata122?.freight_quote_estimate_id || getdata122?.quote_estimate_id;
  // if (initialQuoteEstimateId) {
  //   localStorage.setItem("freight_quote_estimate_id", initialQuoteEstimateId);
  // }
  if (getdata122?.supplier_id) {
    localStorage.setItem("supplierid", getdata122.supplier_id);
  }

  const getFreightId = () => getdata122?.freight_id || getdata122?.id || localStorage.getItem("freightid");
  const getQuoteEstimateId = () => getdata122?.freight_quote_estimate_id || localStorage.getItem("freight_quote_estimate_id");
  const getQouteEstimateId2 = () => getdata122?.quote_estimate_id || localStorage.getItem("quote_estimate_id");
  const getSupplierId = () => getdata122?.supplier_id || freight?.supplier_id || localStorage.getItem("supplierid");

  const getFreightDataById = async () => {
    const fId = getFreightId();
    if (!fId) {
      console.log("No freight ID found in state or localStorage");
      return;
    }
    const payload = {
      freight_id: fId,
    };
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}freight-list-byId`,
        payload
      );
      if (response?.data?.data?.length > 0) {
        setGetdata(response.data.data[0]);
      }
    } catch (error) {
      console.error("Error fetching freight data by id:", error);
    }
  };

  const getFreightQuoteEstimate = async () => {
    const payload = {};
    const quoteEstimateId = getQuoteEstimateId();
    if (quoteEstimateId) {
      payload.freight_quote_estimate_id = parseInt(quoteEstimateId);
    }
    const fId = getFreightId();
    if (fId) {
      payload.freight_id = parseInt(fId);
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}GetFreightQuoteEstimateById`,
        payload
      );
      if (response.data && response.data.success && response.data.data) {
        const rawData = response.data.data;
        const estimateData = Array.isArray(rawData) ? rawData[0] : rawData;
        if (estimateData) {
          loadEstimateData(estimateData);
        }
      }
    } catch (error) {
      console.error("Error fetching freight quote estimate by id:", error);
    }
  };
  //   const andlemodaloen = () => {
  //     setOpenmodal(true);
  //   };
  const handlechangecalc = (e) => {
    const { name, value } = e.target;
    setFreight((prevInputData) => ({
      ...prevInputData,
      [name]: value,
    }));
  };
  const originRowsData = originRows.map(row => ({
    row,
    calc: calculateRowData(row)
  }));
  const totalChangeRoeOrigin = originRowsData.reduce((sum, item) => sum + item.calc.finalAmt, 0);
  const totalOriginDiscount = originRowsData.reduce((sum, item) => sum + item.calc.disc, 0);
  const totalOriginExclusive = originRowsData.reduce((sum, item) => sum + item.calc.exclusive, 0);
  const totalOriginVat = originRowsData.reduce((sum, item) => sum + item.calc.vat, 0);
  const totalOriginInclusive = originRowsData.reduce((sum, item) => sum + item.calc.inclusive, 0);

  const freightRowsData = freightRows.map(row => ({
    row,
    calc: calculateRowData(row)
  }));
  const totalChangeRoeFreight = freightRowsData.reduce((sum, item) => sum + item.calc.finalAmt, 0);
  const totalFreightDiscount = freightRowsData.reduce((sum, item) => sum + item.calc.disc, 0);
  const totalFreightExclusive = freightRowsData.reduce((sum, item) => sum + item.calc.exclusive, 0);
  const totalFreightVat = freightRowsData.reduce((sum, item) => sum + item.calc.vat, 0);
  const totalFreightInclusive = freightRowsData.reduce((sum, item) => sum + item.calc.inclusive, 0);

  const transitRowsData = transitRows.map(row => ({
    row,
    calc: calculateRowData(row)
  }));
  const totalChangeRoeTransit = transitRowsData.reduce((sum, item) => sum + item.calc.finalAmt, 0);
  const totalTransitDiscount = transitRowsData.reduce((sum, item) => sum + item.calc.disc, 0);
  const totalTransitExclusive = transitRowsData.reduce((sum, item) => sum + item.calc.exclusive, 0);
  const totalTransitVat = transitRowsData.reduce((sum, item) => sum + item.calc.vat, 0);
  const totalTransitInclusive = transitRowsData.reduce((sum, item) => sum + item.calc.inclusive, 0);

  const destinationRowsData = destinationRows.map(row => ({
    row,
    calc: calculateRowData(row)
  }));
  const totalChangeRoeDestination = destinationRowsData.reduce((sum, item) => sum + item.calc.finalAmt, 0);
  const totalDestinationDiscount = destinationRowsData.reduce((sum, item) => sum + item.calc.disc, 0);
  const totalDestinationExclusive = destinationRowsData.reduce((sum, item) => sum + item.calc.exclusive, 0);
  const totalDestinationVat = destinationRowsData.reduce((sum, item) => sum + item.calc.vat, 0);
  const totalDestinationInclusive = destinationRowsData.reduce((sum, item) => sum + item.calc.inclusive, 0);

  const adminRowsData = adminRows.map(row => ({
    row,
    calc: calculateRowData(row)
  }));
  const totalChangeRoeAdmin = adminRowsData.reduce((sum, item) => sum + item.calc.finalAmt, 0);
  const totalAdminDiscount = adminRowsData.reduce((sum, item) => sum + item.calc.disc, 0);
  const totalAdminExclusive = adminRowsData.reduce((sum, item) => sum + item.calc.exclusive, 0);
  const totalAdminVat = adminRowsData.reduce((sum, item) => sum + item.calc.vat, 0);
  const totalAdminInclusive = adminRowsData.reduce((sum, item) => sum + item.calc.inclusive, 0);

  const customsRowsData = customsRows.map(row => ({
    row,
    calc: calculateRowData(row)
  }));
  const totalChangeRoeCustoms = customsRowsData.reduce((sum, item) => sum + item.calc.finalAmt, 0);
  const totalCustomsDiscount = customsRowsData.reduce((sum, item) => sum + item.calc.disc, 0);
  const totalCustomsExclusive = customsRowsData.reduce((sum, item) => sum + item.calc.exclusive, 0);
  const totalCustomsVat = customsRowsData.reduce((sum, item) => sum + item.calc.vat, 0);
  const totalCustomsInclusive = customsRowsData.reduce((sum, item) => sum + item.calc.inclusive, 0);

  // Grand totals
  const grandTotalFinalAmt = totalChangeRoeOrigin + totalChangeRoeFreight + totalChangeRoeTransit + totalChangeRoeDestination + totalChangeRoeAdmin + totalChangeRoeCustoms;
  const grandTotalDiscount = totalOriginDiscount + totalFreightDiscount + totalTransitDiscount + totalDestinationDiscount + totalAdminDiscount + totalCustomsDiscount;
  const grandTotalExclusive = totalOriginExclusive + totalFreightExclusive + totalTransitExclusive + totalDestinationExclusive + totalAdminExclusive + totalCustomsExclusive;
  const grandTotalVat = totalOriginVat + totalFreightVat + totalTransitVat + totalDestinationVat + totalAdminVat + totalCustomsVat;

  const sumofall =
    originRowsData.reduce((sum, item) => sum + item.calc.tCost, 0) +
    freightRowsData.reduce((sum, item) => sum + item.calc.tCost, 0) +
    transitRowsData.reduce((sum, item) => sum + item.calc.tCost, 0) +
    destinationRowsData.reduce((sum, item) => sum + item.calc.tCost, 0) +
    adminRowsData.reduce((sum, item) => sum + item.calc.tCost, 0) +
    customsRowsData.reduce((sum, item) => sum + item.calc.tCost, 0);

  const sumofRoe = grandTotalFinalAmt;
  const totalVatInclusive = grandTotalExclusive + grandTotalVat;

  const estimateCalculate = async () => {
    try {
      const allComponents = [];

      const mapRowToComponent = (row, calc, sectionName) => ({
        ...(row.db_id && { id: row.db_id }),
        admin_frieght_component_id: row.admin_frieght_component_id || null,
        description: row.description || "",
        qty: cleanParseFloat(row.qty) || 0,
        currency: row.currency || "",
        cost: cleanParseFloat(row.cost) || 0,
        unit_type: row.unitType === "1" ? "L/S" : (row.unitType === "2" ? "W/M" : ""),
        unit: calc.unit || 0,
        total_cost: calc.tCost || 0,
        gp_percent: cleanParseFloat(row.gp_percent) || 0,
        sales_price: calc.salesPrice || 0,
        roe: cleanParseFloat(row.roe) || 0,
        final_amount: calc.finalAmt || 0,
        vat_type: row.vatTyp || "",
        disc_percent: cleanParseFloat(row.discPercent) || 0,
        discount: calc.disc || 0,
        exclusive: calc.exclusive || 0,
        vat: calc.vat || 0,
        vat_incl: calc.inclusive || 0,
        comment: row.comment || "",
        name: sectionName
      });

      originRowsData.forEach(({ row, calc }) => {
        if (row.description) {
          allComponents.push(mapRowToComponent(row, calc, "Origin Charges"));
        }
      });
      freightRowsData.forEach(({ row, calc }) => {
        if (row.description) {
          allComponents.push(mapRowToComponent(row, calc, "Freight Charges"));
        }
      });
      transitRowsData.forEach(({ row, calc }) => {
        if (row.description) {
          allComponents.push(mapRowToComponent(row, calc, "Transit Charges"));
        }
      });
      destinationRowsData.forEach(({ row, calc }) => {
        if (row.description) {
          allComponents.push(mapRowToComponent(row, calc, "Destination Charges"));
        }
      });
      adminRowsData.forEach(({ row, calc }) => {
        if (row.description) {
          allComponents.push(mapRowToComponent(row, calc, "Admin Charges"));
        }
      });
      customsRowsData.forEach(({ row, calc }) => {
        if (row.description) {
          allComponents.push(mapRowToComponent(row, calc, "Customs Charges"));
        }
      });

      const payload = {
        freight_id: parseInt(getFreightId()),
        client_id: parseInt(getdata.client_id || getdata.id || getdata.client_ref),
        client_name: getdata.client_name,
        supplier_id: parseInt(getSupplierId()) || null,
        customer_invoice_no: freight.customer_invoice_no || "",
        invoice_for_country: freight.invoice_for_country || "",
        quote_type: "ADMIN",
        date: getdata.date ? new Date(getdata.date).toISOString().split('T')[0] : getTodayDate(),
        final_base_currency: freight.final_base_currency || "Select",
        sumof_totalcost: sumofall || 0,
        sumof_finalamount: sumofRoe || 0,
        sumof_vatincl: totalVatInclusive || 0,
        chargeable: cleanParseFloat(freight.chargable_rate) || 0,
        components: allComponents,
      };

      console.log("[Add Invoice] add-freight-quotes-estimate payload:", payload);
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}add-freight-quotes-estimate`,
        payload
      );
      if (response.data.success === true) {
        toast.success(response.data.message);
      } else {
        console.log("some thing went wrong");
      }
    } catch (error) {
      console.log("Full Error =>", error);
    }
  };

  const supplier = () => {
    const fId = getFreightId();
    if (!fId) {
      console.log("No freight ID found, skipping supplier fetch");
      return Promise.resolve();
    }
    return axios
      .post(`${process.env.REACT_APP_BASE_URL}get-suppler-selected`, {
        freight_id: fId,
      })
      .then((response) => {
        // console.log(response);
        setClient(response.data.data);
      })
      .catch((error) => {
        toast.error(error.response?.data || error.message);
      });
  };
  const handlepresss = (e) => {
    if (e.charCode < 42 || e.charCode > 57) {
      e.preventDefault();
    }
  };
  // ////////////////////////////////////////////////////supplier selected
  const supplierSelected = async () => {
    const fId = getFreightId();
    if (!fId) {
      console.log("No freight ID found, skipping supplierSelected fetch");
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}get-suppler-selected`,
        { freight_id: fId }
      );
      // console.log(response);
      if (response?.data?.data) {
        setSelected(response.data.data.map((item) => item.id));
        // setClient(response.data.data);
      } else {
        console.log("No data found");
      }
    } catch (error) {
      console.log("Something went wrong:", error);
    }
  };
  const dateformate = new Date(getdata?.date).toLocaleDateString("en-GB");
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const getsupplier = () => {
    return axios
      .get(`${process.env.REACT_APP_BASE_URL}supplier-list`)
      .then((response) => {
        setSupplierdata(response.data.data);
        setSuppluierquot(response.data.data);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };

  const getdataapi = async () => {
    const quoteEstimateId = getQuoteEstimateId();
    const freightId = getFreightId();
    if (!quoteEstimateId && !freightId) {
      console.log("No quote_estimate_id or freight_id found to fetch estimate in getdataapi");
      return;
    }
    const data123456 = {
      quote_estimate_id: quoteEstimateId,
      estimate_id: quoteEstimateId,
      freight_id: freightId,
      freight,
    };
    const suppId = getSupplierId();
    if (suppId) {
      data123456.supplier_id = parseInt(suppId);
    }
    await axios
      .post(`${process.env.REACT_APP_BASE_URL}get-shipestimate`, data123456)
      .then((response) => {
        console.log(response.data.data);
        const rawData = response.data.data;
        const estimateData = Array.isArray(rawData) ? rawData[0] : rawData;
        if (estimateData) {
          setFreight(mapEstimateComponentsToFlatFields(estimateData) || [0]);
        }
      })
      .catch((error) => {
        console.log(error.response?.data || error.message);
      });
  };

  // const getNewDataapi = async () => {
  //   const quoteEstimateId = getQouteEstimateId2();
  //   if (!quoteEstimateId) {
  //     console.log("No quote_estimate_id or freight_quote_estimate_id found to fetch estimate in getNewDataapi");
  //     return;
  //   }
  //   const data123456 = {
  //     quote_estimate_id: quoteEstimateId,
  //     freight_id: getFreightId(),
  //   };
  //   await axios
  //     .post(
  //       `${process.env.REACT_APP_BASE_URL}GetQuoteShipEstimateById`,
  //       data123456
  //     )
  //     .then((response) => {
  //       console.log(response.data.data);
  //       const rawData = response.data.data;
  //       const estimateData = Array.isArray(rawData) ? rawData[0] : rawData;
  //       if (estimateData) {
  //         setFreight(mapEstimateComponentsToFlatFields(estimateData) || [0]);
  //       }
  //     })
  //     .catch((error) => {
  //       console.log(error.response?.data || error.message);
  //     });
  // };

  const freightId = getFreightId();
  const quoteEstimateId = getQuoteEstimateId();
  const quoteEstimateId2 = getQouteEstimateId2();

  useEffect(() => {
    // Reset data
    const freshFreight = location?.state?.freight
      ? mapEstimateComponentsToFlatFields(location?.state?.freight)
      : mapEstimateComponentsToFlatFields(location?.state?.data) || [0];
    setFreight(freshFreight);

    setOriginRows([]);
    setFreightRows([]);
    setTransitRows([]);
    setDestinationRows([]);
    setAdminRows([]);
    setCustomsRows([]);
  }, [freightId, quoteEstimateId, quoteEstimateId2]);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          getsupplier(),
          getFreightDataById(),
          getdataapi(),
          // getNewDataapi(),
          getFreightQuoteEstimate(),
          supplier(),
          supplierSelected(),
          getdata1(),
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, [freightId, quoteEstimateId, quoteEstimateId2]);

  const handleclicknav = () => {
    window.history.back();
  };
  const getdata1 = () => {
    return axios
      .get(`${process.env.REACT_APP_BASE_URL}supplier-list`)
      .then((response) => {
        setDat(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };
  const handleAddSupplier = async () => {
    if (selected.length === 0) {
      toast.error("Please select at least one supplier.");
      return;
    }
    const response = await axios.post(
      `${process.env.REACT_APP_BASE_URL}/freight/assign-Suppliers`,
      { freight_id: getFreightId(), supplier_ids: selected }
    );
    if (response.data.success) {
      toast.success(response.data.message);
      setOpenmodal(false);
    }
    // console.log("something went wrong")
  };
  const downloadPDF = () => {
    downloadPDF1();
  };

  // ---------------------------------------------------------------------
  // PDF generation - jsPDF + jspdf-autotable
  // ---------------------------------------------------------------------
  // Why this replaces html2pdf.js / react-to-pdf:
  //   Both of those libraries work by screenshotting the rendered DOM
  //   (html2canvas) and then slicing that single tall image into
  //   page-sized strips. That slicing happens at fixed pixel offsets, so
  //   it has no idea where a table row actually starts/ends - which is
  //   exactly what caused rows (and the GRAND TOTAL block) to be cut in
  //   half or dropped onto a stray page.
  //
  //   jsPDF + autoTable instead draws every cell directly onto the PDF
  //   canvas using real PDF text/vector primitives. autoTable measures
  //   each row's height up front, so:
  //     - rowPageBreak: "avoid"  -> a row is NEVER split across pages;
  //       if it doesn't fit, the whole row moves to the next page.
  //     - showHead: "everyPage"  -> the column header re-prints at the
  //       top of every new page automatically.
  //     - output is vector text, not a re-scaled screenshot, so quality
  //       is sharp at any zoom level and the file size is much smaller.

  // Loads an imported image asset (e.g. the logo) as a base64 data URL
  // so it can be embedded with doc.addImage(). Returns null on failure
  // so the PDF can still be generated without the logo.
  const loadImageAsDataUrl = async (url) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error("Could not load logo for PDF:", err);
      return null;
    }
  };

  // Small helper: draws a bold label on the left and a value right
  // aligned within the same row, used throughout the info boxes.
  const drawLabelValueRow = (doc, x, y, width, label, value) => {
    doc.setFontSize(8.5);
    doc.setTextColor(20, 20, 20);
    const valStr = String(value ?? "");
    const labelStr = String(label ?? "");
    doc.setFont("helvetica", "normal");
    const valW = valStr ? doc.getTextWidth(valStr) : 0;
    const maxLabelW = width - valW - 3;
    doc.setFont("helvetica", "bold");
    const truncatedLabel = doc.splitTextToSize(labelStr, maxLabelW > 0 ? maxLabelW : width)[0] ?? "";
    doc.text(truncatedLabel, x, y);
    doc.setFont("helvetica", "normal");
    if (valStr) {
      doc.text(valStr, x + width, y, { align: "right" });
    }
  };

  // Draws a navy "section bar" header used inside the info boxes
  // (e.g. "Shipment Details", "Rate of Exchange").
  const drawSectionBar = (doc, x, y, width, height, text) => {
    doc.setFillColor(27, 34, 69);
    doc.rect(x, y, width, height, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(text, x + width / 2, y + height / 2 + 1.2, { align: "center" });
    doc.setTextColor(20, 20, 20);
  };

  const buildSectionRows = (title, rowsData, totals) => {
    if (!rowsData || rowsData.length === 0) return [];

    const sectionStyle = { fillColor: [240, 242, 245], fontStyle: "bold", halign: "left", textColor: [20, 20, 20] };
    const totalStyle = { fillColor: [250, 250, 250], fontStyle: "bold", textColor: [20, 20, 20] };
    const styledCell = (content, styles) => ({ content: content ?? "", styles });

    const rows = [];

    // Section header row
    rows.push([{ content: title, colSpan: 11, styles: sectionStyle }]);

    rowsData.forEach(({ row, calc }) => {
      const uom = row.unitType === "1" ? "L/S" : row.unitType === "2" ? "W/M" : "";

      // ✅ Show percentage with 2 decimals in VAT Type column
      const vatDisplay = formatValue(getVatPercent(row.vatTyp), 2, true);
      rows.push([
        row.description || "",
        row.qty || "",
        uom,
        displayRowUnit(row.unitType) ?? "",
        formatValue(calc.salesPrice, 2),
        row.currency && row.currency !== "Select" ? row.currency : "",
        formatValue(row.roe, 4),
        vatDisplay,
        formatValue(row.discPercent, 2, true),
        formatValue(calc.exclusive),
        formatValue(calc.inclusive),
      ]);

      if (row.comment) {
        rows.push([
          {
            content: `Comment: ${row.comment}`,
            colSpan: 11,
            styles: { fontStyle: "italic", textColor: [100, 100, 100], cellPadding: 2 }
          }
        ]);
      }
    });

    // Section total row
    rows.push([
      { content: `Total - ${title}`, colSpan: 7, styles: { ...totalStyle, halign: "left" } },
      styledCell("", totalStyle),
      styledCell("", totalStyle),
      styledCell(formatValue(totals.exclusive), totalStyle),
      styledCell(formatValue(totals.inclusive), totalStyle),
    ]);

    return rows;
  };

  const downloadPDF1 = async () => {
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth(); // 297mm
      const pageHeight = doc.internal.pageSize.getHeight(); // 210mm
      const margin = 7;
      const contentWidth = pageWidth - margin * 2;
      const colSplitX = margin + contentWidth / 2;

      // ---- Top header: logo + company info ---------------------------
      let cursorY = margin;
      const logoDataUrl = await loadImageAsDataUrl(logo);
      if (logoDataUrl) {
        try {
          const fmt = (logoDataUrl.split(";")[0].split("/")[1] || "PNG").toUpperCase();
          doc.addImage(logoDataUrl, fmt, margin, cursorY, 38, 17);
        } catch (err) {
          console.error("Could not embed logo image:", err);
        }
      }

      const companyX = margin + 120;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(20, 20, 20);
      doc.text("Asia Direct - Africa", companyX, cursorY + 5);
      doc.setDrawColor(200, 40, 40);
      doc.setLineWidth(0.6);
      doc.line(companyX, cursorY + 6.5, companyX + 38, cursorY + 6.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 60);
      const companyLines = [
        "Asia Direct - Africa (Pty) Ltd",
        "Unit 4, Gleneagles Office Park, 39 Koorsboom Ave, Glen Marais",
      ];
      let infoY = cursorY + 11;
      const maxWidth = 70; // Adjust as needed
      companyLines.forEach((line) => {
        doc.text(line, companyX, infoY, {
          maxWidth: maxWidth,
        });

        // Calculate how many lines the text wrapped into
        const lineCount = doc.splitTextToSize(line, maxWidth).length;

        // Move Y position based on wrapped lines
        infoY += lineCount * 3.6;
      });
      drawLabelValueRow(doc, companyX, infoY, 0, "Registration No.:- ", "");
      doc.setFont("helvetica", "bold");
      doc.text("Registration No.:- ", companyX, infoY);
      doc.setFont("helvetica", "normal");

      doc.text(String(freight?.company_address?.company_registration_no || ""), companyX + 25, infoY);
      infoY += 3.6;
      doc.setFont("helvetica", "bold");
      doc.text("VAT No.:- ", companyX, infoY);
      doc.setFont("helvetica", "normal");
      doc.text(String(freight?.company_address?.tax_vat_no || ""), companyX + 14, infoY);
      infoY += 3.6;
      doc.setFont("helvetica", "bold");
      doc.text("Importers code:- ", companyX, infoY);
      doc.setFont("helvetica", "normal");
      doc.text(String(freight?.company_address?.postal_code || ""), companyX + 24, infoY);

      cursorY = margin + 30.5;

      // ---- "FREIGHT ESTIMATE" title bar -------------------------------
      doc.setDrawColor(27, 34, 69);
      doc.setLineWidth(0.5);
      doc.rect(margin, cursorY, contentWidth, 7);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(20, 20, 20);
      doc.text("FREIGHT ESTIMATE", pageWidth / 2, cursorY + 4.8, { align: "center" });
      cursorY += 7;

      // ---- Main info box (left: shipment, right: invoice) ------------
      // rowH:    full height of each data row (text vertically centered inside)
      // barH:    height of navy section header bar
      // pad:     inner top/bottom padding
      // lPad:    inner left/right padding

      const rowH = 4.5;   // row height — text baseline = rowTop + rowH*0.65
      const barH = 5.5;
      const pad = 3;
      const lPad = 3;

      const lW = contentWidth / 2 - lPad * 2;
      const rW = contentWidth / 2 - lPad * 2;

      // Helper: draw a row of label+value with text vertically centred in rowH
      const drawRow = (doc, x, rowTop, width, label, value) => {
        const baseline = rowTop + rowH * 0.68; // ~68% down = optical centre for 8.5pt
        drawLabelValueRow(doc, x, baseline, width, label, value);
      };

      const boxTop = cursorY;

      // ── LEFT COLUMN ──────────────────────────────────────────────────
      let ly = boxTop + pad;

      // Client name + address (no row-height wrapper, just natural text)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(20, 20, 20);
      doc.text(String(getdata?.client_name || ""), margin + lPad, ly + 2.5);
      ly += 5; // line spacing matches address below

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      // Wrap the address ourselves (instead of relying on jsPDF's built-in
      // maxWidth wrapping) so we know exactly how many lines it produced —
      // that lets us push everything below (section bars, rows, borders)
      // down automatically instead of assuming a fixed single-line height.
      const addressLineHeight = 4; // matches the company-block line spacing above
      const addressLines = doc.splitTextToSize(String(getdata?.address_1 || ""), lW);
      addressLines.forEach((line, idx) => {
        doc.text(line, margin + lPad, ly + 2.5 + idx * addressLineHeight);
      });
      // Single line keeps the original 6mm gap; each extra wrapped line adds
      // one more line-height on top of that.
      ly += addressLines.length * addressLineHeight + 1;

      // Section bar — ly = top of bar
      drawSectionBar(doc, margin, ly, contentWidth / 2, barH, "Cargo Details ISO Commodity");
      ly += barH; // ly now = top of first data row

      const leftFields = [
        ["Commodity", getdata?.product_desc],
        ["Hazardous", getdata?.hazardous?.toLowerCase() === "no"
          ? "No"
          : getdata?.hazard_type],
        ["No. of Packages", getdata?.no_of_packages],
        ["Package Type", getdata?.package_type],
        ["Gross Weight (kgs)", getdata?.weight],
        ["Dimensions (M3)", getdata?.dimension || ""],
        ["Volumetric (kgs)", getdata?.volumetric_weight],
        ["Chargeable", formatValue(freight?.chargable_rate, 3)],
      ];
      leftFields.forEach(([label, value]) => {
        drawRow(doc, margin + lPad, ly, lW, label, value);
        ly += rowH;
      });

      // Rate of Exchange bar immediately after last row
      drawSectionBar(doc, margin, ly, contentWidth / 2, barH, "Rate of Exchange");
      ly += barH + 2;

      drawRow(doc, margin + lPad, ly, lW, "Base Currency", freight?.final_base_currency || "");
      ly += rowH;
      drawRow(doc, margin + lPad, ly, lW, "Payment Terms", freight?.payment_terms || "");
      ly += rowH + pad; // tight bottom padding

      // ── RIGHT COLUMN ─────────────────────────────────────────────────
      let ry = boxTop + pad - 0.7;
      const rightColX = colSplitX + lPad;

      const invoiceFields = [
        ["Invoice For", freight?.invoice_for_country],
        ["Client Ref", freight?.customer_invoice_no],
        ["Reference", freight?.reference_no],
        ["Quote Date", getdata?.date ? new Date(getdata.date).toLocaleDateString("en-GB") : ""],
        ["Quote Validity", freight?.quote_validity],
      ];
      invoiceFields.forEach(([label, value]) => {
        drawRow(doc, rightColX, ry, rW, label, value);
        ry += rowH;
      });

      // Shipment Details bar immediately after invoice rows
      drawSectionBar(doc, colSplitX, ry + 0.5, contentWidth / 2, barH, "Routing Details");
      ry += barH + 0.5;

      const shipmentFields = [
        ["Country of Origin", getdata?.collection_from_name],
        ["Place of Receipt", getdata?.port_of_loading],
        ["Port of Loading", getdata?.port_of_loading],
        ["Port of Discharge", getdata?.post_of_discharge],
        ["Place of Delivery", getdata?.delivery_to_name],
        ["Incoterm", getdata?.incoterm],
        ["Mode of Transport", getdata?.freight],
      ];
      shipmentFields.forEach(([label, value]) => {
        drawRow(doc, rightColX, ry, rW, label, value);
        ry += rowH;
      });
      ry += 1.5; // tight bottom padding

      // Freight details bar on the right
      drawSectionBar(doc, colSplitX, ry + 0.5, contentWidth / 2, barH, "Freight details");
      ry += barH + 0.5;

      const freightFields = [
        ["Freight No", getdata?.freight_number],
        ["Load type", getdata?.fcl_lcl],
        ["Transit Priority", getdata?.type],
        ["Insurance", getdata?.insurance],
      ];
      freightFields.forEach(([label, value]) => {
        drawRow(doc, rightColX, ry, rW, label, value);
        ry += rowH;
      });
      ry += 1.5; // tight bottom padding

      // ── BORDERS — drawn AFTER all content so heights are exact ───────
      const leftBoxH = ly - boxTop;
      const rightBoxH = ry - boxTop;
      const outerBoxH = Math.max(leftBoxH, rightBoxH);

      doc.setDrawColor(27, 34, 69);
      doc.setLineWidth(0.5);
      doc.rect(margin, boxTop, contentWidth, outerBoxH);
      doc.line(colSplitX, boxTop, colSplitX, boxTop + outerBoxH);
      if (rightBoxH < outerBoxH) {
        doc.line(colSplitX, boxTop + rightBoxH, margin + contentWidth, boxTop + rightBoxH);
      }

      cursorY = boxTop + outerBoxH + 4;

      // ---- "QUOTE INFORMATION" label -----------------------------------
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(20, 20, 20);
      doc.text("QUOTE INFORMATION", margin, cursorY);
      cursorY += 3;
      // ---- Charges table (autoTable) -----------------------------------
      const tableBody = [
        ...buildSectionRows("Origin Charges", originRowsData, {
          finalAmt: totalChangeRoeOrigin, disc: totalOriginDiscount, exclusive: totalOriginExclusive, vat: totalOriginVat, inclusive: totalOriginInclusive,
        }),
        ...buildSectionRows("Freight Charges", freightRowsData, {
          finalAmt: totalChangeRoeFreight, disc: totalFreightDiscount, exclusive: totalFreightExclusive, vat: totalFreightVat, inclusive: totalFreightInclusive,
        }),
        ...buildSectionRows("Transit Charges", transitRowsData, {
          finalAmt: totalChangeRoeTransit, disc: totalTransitDiscount, exclusive: totalTransitExclusive, vat: totalTransitVat, inclusive: totalTransitInclusive,
        }),
        ...buildSectionRows("Destination Charges", destinationRowsData, {
          finalAmt: totalChangeRoeDestination, disc: totalDestinationDiscount, exclusive: totalDestinationExclusive, vat: totalDestinationVat, inclusive: totalDestinationInclusive,
        }),
        ...buildSectionRows("Admin Charges", adminRowsData, {
          finalAmt: totalChangeRoeAdmin, disc: totalAdminDiscount, exclusive: totalAdminExclusive, vat: totalAdminVat, inclusive: totalAdminInclusive,
        }),
        ...buildSectionRows("Customs Charges", customsRowsData, {
          finalAmt: totalChangeRoeCustoms, disc: totalCustomsDiscount, exclusive: totalCustomsExclusive, vat: totalCustomsVat, inclusive: totalCustomsInclusive,
        }),
        [
          { content: "GRAND TOTAL", colSpan: 9, styles: { fillColor: [240, 242, 245], fontStyle: "bold", halign: "left", textColor: [20, 20, 20], valign: "top" } },
          {
            content: `Subtotal:\nDiscount:\nExclusive:\nVAT:\nGrand Total:`,
            colSpan: 1,
            styles: { fillColor: [226, 232, 240], fontStyle: "bold", halign: "left", textColor: [20, 20, 20], cellPadding: 2, lineWidth: 0 }
          },
          {
            content: `${formatValue(grandTotalFinalAmt)}\n${grandTotalDiscount > 0 ? `-${formatValue(grandTotalDiscount)}` : "0.00"}\n${formatValue(grandTotalExclusive)}\n${formatValue(grandTotalVat)}\n${formatValue(totalVatInclusive)}`,
            colSpan: 1,
            styles: { fillColor: [226, 232, 240], fontStyle: "bold", halign: "right", textColor: [20, 20, 20], cellPadding: 2, lineWidth: 0 }
          }
        ],
      ];

      autoTable(doc, {
        startY: cursorY,
        margin: { left: margin, right: margin, top: margin, bottom: 14 },
        head: [["Description", "QTY", "UOM", "Unit", "Sales/ P", "Curr", "Exch Rate", "Vat %", "Disc %", "Exclusive", "Total"]],
        body: tableBody,
        theme: "grid",
        styles: {
          fontSize: 7.5,
          cellPadding: 1.6,
          valign: "middle",
          lineColor: [28, 28, 28],
          lineWidth: 0.1,
          textColor: [20, 20, 20],
        },
        headStyles: {
          fillColor: [27, 34, 69],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "left",
          lineColor: [255, 255, 255],
        },
        columnStyles: {
          9: { halign: "right" },
          10: { halign: "right" },
        },
        // Never slice a row across two pages - if it doesn't fit, the
        rowPageBreak: "avoid",
        showHead: "everyPage",
        didDrawCell: (data) => {
          if (data.row.raw && data.row.raw[0] && data.row.raw[0].content === "GRAND TOTAL") {
            const { x, y, width, height } = data.cell;
            doc.setDrawColor(28, 28, 28);
            doc.setLineWidth(0.1);
            if (data.column.index === 9) {
              doc.line(x, y, x + width, y);
              doc.line(x, y + height, x + width, y + height);
              doc.line(x, y, x, y + height);
            } else if (data.column.index === 10) {
              doc.line(x, y, x + width, y);
              doc.line(x, y + height, x + width, y + height);
              doc.line(x + width, y, x + width, y + height);
            }
          }
        },
      });

      // ── TERMS & CONDITIONS + BANKING DETAILS (dynamic, page-break aware) ──
      // Visual design follows the bordered header-bar + content-box pattern used
      // elsewhere in this document (e.g. "SHIPMENT ESTIMATE"). The box's height is
      // measured from its actual content, and the whole box — like Banking
      // Details below it — moves to a fresh page as a unit whenever it doesn't
      // fit in the remaining space, so longer/variable content (e.g. once this
      // is fetched dynamically) never gets cut off or overlaps the footer.
      const bottomLimit = pageHeight - 15;
      const boxWidth = pageWidth - margin * 2;
      const innerWidth = boxWidth - 6; // 3mm padding each side
      const lineHeight = 3.6;

      const ensureSpace = (y, neededHeight) => {
        if (y + neededHeight > bottomLimit) {
          doc.addPage();
          return margin;
        }
        return y;
      };

      // Lays out "<boldLead> <text>" as one paragraph: the bold lead starts the
      // first line, the rest of the text wraps normally beneath it.
      const layoutBoldLeadParagraph = (boldLead, text, maxWidth) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        const leadWidth = doc.getTextWidth(`${boldLead} `);
        doc.setFont("helvetica", "normal");
        const words = String(text ?? "").split(" ");
        let firstLine = "";
        let i = 0;
        const firstLineMaxWidth = maxWidth - leadWidth;
        while (i < words.length) {
          const candidate = firstLine ? `${firstLine} ${words[i]}` : words[i];
          if (!firstLine || doc.getTextWidth(candidate) <= firstLineMaxWidth) {
            firstLine = candidate;
            i++;
          } else break;
        }
        const restLines = i < words.length ? doc.splitTextToSize(words.slice(i).join(" "), maxWidth) : [];
        return { leadWidth, firstLine, restLines, height: (1 + restLines.length) * lineHeight };
      };

      // ── Measure content first so the box can be drawn at its exact height ──
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      const introWrapped = doc.splitTextToSize(termsAndConditions.intro, innerWidth);
      const introHeight = introWrapped.length * lineHeight;

      const itemLayouts = termsAndConditions.items.map((item, index) => ({
        boldLead: `${index + 1}. ${item.label}:`,
        layout: layoutBoldLeadParagraph(`${index + 1}. ${item.label}:`, item.text, innerWidth),
      }));
      const itemsHeight = itemLayouts.reduce((sum, { layout }) => sum + layout.height + 1.5, 0);

      const headerH = 7;
      const topPad = 4;
      const bottomPad = 3;
      const contentHeight = topPad + introHeight + 2 + itemsHeight + bottomPad;
      const boxHeight = headerH + contentHeight;

      let termsY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 8 : cursorY + 20;
      termsY = ensureSpace(termsY, boxHeight);

      // ── Header bar (bordered, matches the on-screen "TERMS & CONDITIONS" label) ──
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.rect(margin, termsY, boxWidth, headerH);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(20, 20, 20);
      doc.text("TERMS & CONDITIONS", margin + 3, termsY + headerH / 2 + 1.3);

      // ── Content box ──
      doc.rect(margin, termsY + headerH, boxWidth, contentHeight);

      let ty = termsY + headerH + topPad;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(60, 60, 60);
      introWrapped.forEach((line) => {
        doc.text(line, margin + 3, ty);
        ty += lineHeight;
      });
      ty += 2;

      itemLayouts.forEach(({ boldLead, layout }) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(20, 20, 20);
        doc.text(`${boldLead} `, margin + 3, ty);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        doc.text(layout.firstLine, margin + 3 + layout.leadWidth, ty);
        let innerTy = ty + lineHeight;
        layout.restLines.forEach((line) => {
          doc.text(line, margin + 3, innerTy);
          innerTy += lineHeight;
        });
        ty += layout.height + 1.5;
      });

      // ── Banking Details — kept as one block; moves to a new page if it won't fit ──
      let bankingStartY = termsY + boxHeight + 10;
      const bankingFields = [
        ["Account Name", freight?.bank_details?.account_name || ""],
        ["Bank Name", freight?.bank_details?.bank_name || ""],
        ["Branch Code", freight?.bank_details?.branch_code || ""],
        ["Account Number", freight?.bank_details?.account_no || ""],
        ["Swift Code", freight?.bank_details?.swift_code || ""],
      ];

      const noteText = freight?.bank_details?.note || "";
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7);
      const noteLines = noteText ? doc.splitTextToSize(noteText, 80) : [];

      const bankingBlockH = 5 + bankingFields.length * 4.2 + 2 + (noteLines.length > 0 ? (noteLines.length * 3.5 + 2) : 0);

      bankingStartY = ensureSpace(bankingStartY, bankingBlockH);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(20, 20, 20);
      doc.text("Banking Details", margin, bankingStartY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.2);
      bankingFields.forEach(([label, value], index) => {
        const fieldY = bankingStartY + 5 + index * 4.2;
        doc.setFont("helvetica", "bold");
        doc.text(`${label}:`, margin + 2, fieldY);
        doc.setFont("helvetica", "normal");
        if (value) {
          doc.text(String(value), margin + 32, fieldY);
        }

      });

      if (noteLines.length > 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        let noteY = bankingStartY + 5 + bankingFields.length * 4.2 + 2;
        noteLines.forEach((line) => {
          doc.text(line, margin + 2, noteY);
          noteY += 3.5;
        });
      }

      // ── Page numbers on every page (added after pagination is finalized) ──
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: "right" });
      }

      doc.save("client-estimate.pdf");
    } catch (err) {
      console.error("PDF generation failed", err);
      toast.error("Failed to generate PDF");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f8fafc" }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading Estimate...</span>
          </div>
          <p style={{ marginTop: 15, fontSize: 16, fontWeight: 500, color: "#1b2245" }}>Loading Estimate Details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="wpWrapper ">
        <div className="container-fluid">
          <div>
            <div>
              <div className="row mb-2">
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex">
                      <div>
                        <ArrowBackIcon
                          onClick={handleclicknav}
                          style={{ cursor: "pointer" }}
                        />
                      </div>
                      <div>
                        <h4 className="freight_hd mt-0 ms-3">Supplier Form</h4>
                      </div>
                    </div>
                    {/* <button onClick={andlemodaloen} className="btn btn-success">
                      Assign Supplier
                    </button> */}
                    <MdDownloadForOffline
                      onClick={() => downloadPDF()}
                      className="fs-2"
                      style={{ color: "#1b2245", cursor: "pointer" }}
                    />
                  </div>
                </div>
              </div>

              <section ref={pdfRef} style={{ margin: 0, padding: 0 }}>
                <div
                  style={{
                    width: "100%",
                    padding: "20px",
                    outline: "auto",
                    height: "auto",
                  }}
                  className="pdf-page"
                >
                  <div style={{ display: "block" }}>
                    <table style={{ width: "100%", marginBottom: "20px" }}>
                      <tbody>
                        <tr>
                          <td style={{ width: "50%" }}>
                            <div>
                              <img
                                style={{ height: 55 }}
                                src={logo}
                                alt="hellow"
                              />
                            </div>
                          </td>
                          <td style={{ width: "50%", color: "#000" }}>
                            <p
                              style={{
                                fontSize: 20,
                                fontWeight: 600,
                                marginBottom: "unset",
                                borderBottom: "1px solid #cb191e",
                                display: "inline-block",
                                paddingBottom: 5,
                              }}
                            >
                              Asia Direct - Africa
                            </p>
                            <p
                              style={{
                                fontSize: 13,
                                fontWeight: 500,
                                marginBottom: "unset",
                                lineHeight: "1.5",
                                marginTop: 2,
                              }}
                            >
                              {freight?.company_address?.company_name || ""}<br />
                              {freight?.company_address?.address_line || ""}
                            </p>
                            <p>
                              <span><b>Registration No.:-</b> {freight?.company_address?.company_registration_no || ""}</span><br />
                              <span><b>VAT No.:-</b> {freight?.company_address?.tax_vat_no || ""}</span><br />
                              <span><b>Importers code:-</b> {freight?.company_address?.postal_code || ""}</span>
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    {/* <table style={{ paddingTop: "20px", marginTop: "20px" }}>
                      <tbody>
                        <tr>
                          <td
                            style={{ fontSize: 13, textTransform: "lowercase" }}
                          ></td>
                          <td
                            style={{
                              fontSize: 13,
                              padding: "0px 20px",
                              textTransform: "lowercase",
                            }}
                          ></td>
                          <td
                            style={{ fontSize: 13, textTransform: "lowercase" }}
                          ></td>
                        </tr>
                      </tbody>
                    </table> */}
                    <table
                      style={{
                        border: "2px solid #1b2245",
                        padding: "10px 20px",
                        width: "100%",
                      }}
                    >
                      <tbody>
                        <tr>
                          <td
                            style={{
                              textAlign: "center",
                              fontSize: 13,
                              fontWeight: 600,
                              width: "100%",
                            }}
                          >
                            FREIGHT ESTIMATE
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div
                      style={{
                        border: "2px solid #1b2245",
                        borderTop: "unset",
                        width: "100%",
                        display: "flex",
                        alignItems: "stretch",
                      }}
                    >
                      <div
                        style={{
                          width: "50%",
                          borderRight: "2px solid #1a2142",
                          boxSizing: "border-box",
                        }}
                      >
                        <table>
                          <tbody>
                            <tr>
                              <td
                                style={{
                                  fontSize: 13,
                                  padding: "0px 6px",
                                }}
                              >
                                <strong>
                                  {getdata?.client_name}
                                  <br />
                                  {getdata?.address_1}
                                </strong>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          style={{
                            background: "#1b2245",
                            width: "100%",
                            color: "white",
                            fontSize: 13,
                            textAlign: "center",
                            margin: "5px 0px",
                            padding: 2,
                          }}
                        >
                          <tbody>
                            <tr>
                              <td style={{ fontSize: 13 }}>
                                Cargo Details ISO Commodity
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table style={{ width: "100%" }}>
                          <tbody>
                            <tr>
                              { }
                              <td style={{ padding: "0px 6px" }}>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    <strong>Commodity</strong>
                                  </p>
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    {getdata?.product_desc}
                                  </p>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    <strong>Hazardous</strong>
                                  </p>
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    {getdata.hazardous?.toLowerCase() === "no"
                                      ? "No"
                                      : getdata.hazard_type}
                                  </p>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    <strong>No. of Packages</strong>
                                  </p>
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    {getdata?.no_of_packages}
                                  </p>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    <strong>Package Type</strong>
                                  </p>
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                      textTransform: "capitalize"
                                    }}
                                  >
                                    {getdata?.package_type}
                                  </p>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    <strong>Gross Weight (kgs)</strong>
                                  </p>
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    {getdata?.weight}
                                  </p>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    <strong>Dimensions (M3)</strong>
                                  </p>
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >{getdata?.dimension}</p>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    <strong>Volumetric (kgs)</strong>
                                  </p>
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    {getdata?.volumetric_weight}
                                  </p>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    <strong>Chargeable</strong>
                                  </p>
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    <input
                                      type="text"
                                      onKeyPress={handlepresss}
                                      name="chargable_rate"
                                      value={freight.chargable_rate}
                                      onChange={handlechangecalc}
                                    ></input>
                                  </p>
                                </div>


                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          style={{
                            background: "#1b2245",
                            width: "100%",
                            color: "white",
                            fontSize: 13,
                            textAlign: "center",
                            margin: "5px 0px",
                            padding: 2,
                          }}
                        >
                          <tbody>
                            <tr>
                              <td style={{ fontSize: 13 }}>
                                Rate of Exchange
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table style={{ width: "100%" }}>
                          <tbody>
                            <tr>
                              <td>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    padding: 6,
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                    }}
                                  >
                                    <strong>Base Currency</strong>
                                  </p>
                                  <select
                                    className="select_supplier border"
                                    style={{
                                      margin: 0,
                                      fontSize: 13,
                                      fontWeight: 700,
                                      paddingLeft: 5,
                                      width: "40%",
                                      border: "2px",
                                    }}
                                    onChange={handlechangecalc}
                                    name="final_base_currency"
                                    value={freight?.final_base_currency}
                                  >
                                    <option>Select</option>
                                    <option value="RAND">RAND</option>
                                    <option value="USD">USD</option>
                                    <option value="INR">INR</option>
                                    <option value="EURO">EURO</option>
                                  </select>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    padding: 6,
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                    }}
                                  >
                                    <strong>Payment Terms</strong>
                                  </p>
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      fontWeight: 700,
                                      paddingRight: 6,
                                    }}
                                  >
                                    {freight?.payment_terms || ""}
                                  </p>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div style={{ width: "50%", paddingTop: 5, boxSizing: "border-box" }}>
                        <table style={{ width: "100%" }}>
                          <tbody>
                            <tr>
                              <td style={{
                                width: 170,
                                display: "block",
                                padding: "0px 6px",
                                fontSize: 13,
                              }}><strong>
                                  Invoice For
                                </strong></td>
                              <td
                                style={{ paddingBottom: 3, fontSize: 13, textAlign: "right", paddingRight: "6px" }}
                              >
                                {freight?.invoice_for_country || ""}
                              </td>
                              {/* <td style={{ fontSize: 13, marginBottom: 4, }}>
                                    <select
                                      name="invoice_for_country"
                                      value={freight.invoice_for_country || ""}
                                      onChange={handlechangecalc}
                                      style={{ width: "100%", padding: "2px" }}
                                    >
                                      <option value="">Select Country</option>
                                      <option value="South Africa">South Africa</option>
                                      <option value="Zambia">Zambia</option>
                                      <option value="Zimbabwe">Zimbabwe</option>
                                    </select>
                                  </td> */}
                            </tr>
                            <tr>
                              <td style={{
                                width: 170,
                                display: "block",
                                padding: "0px 6px",
                                fontSize: 13,
                              }}><strong>
                                  Client Ref
                                </strong></td>
                              <td
                                style={{ fontSize: 13, textAlign: "right", paddingBottom: "3px", paddingRight: "6px" }}
                              >
                                {freight?.customer_invoice_no || ""}
                              </td>
                              {/* <td style={{ fontSize: 13, paddingTop: "5px" }}>
                                    <input
                                      type="text"
                                      name="customer_invoice_no"
                                      value={freight.customer_invoice_no || ""}
                                      onChange={handlechangecalc}
                                    ></input>
                                  </td> */}
                            </tr>
                            <tr>
                              <td
                                style={{
                                  width: 170,
                                  display: "block",
                                  padding: "0px 6px",
                                  fontSize: 13,
                                }}
                              >
                                <strong>Reference</strong>
                              </td>
                              <td
                                style={{ fontSize: 13, textAlign: "right", paddingBottom: "3px", paddingRight: "6px" }}
                              >
                                {freight?.reference_no}
                              </td>
                            </tr>
                            <tr>
                              <td
                                style={{
                                  padding: "0px 6px 6px 6px",
                                  width: 170,
                                  display: "block",
                                  fontSize: 13,
                                }}
                              >
                                <strong>Quote Date</strong>
                              </td>
                              <td
                                style={{
                                  fontSize: 13, textAlign: "right", paddingBottom: "3px", paddingRight: "6px"
                                }}
                              >
                                {new Date(getdata?.date).toLocaleDateString(
                                  "en-GB"
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td
                                style={{
                                  padding: "0px 6px 6px 6px",
                                  width: 170,
                                  display: "block",
                                  fontSize: 13,
                                }}
                              >
                                <strong>Quote Validity</strong>
                              </td>
                              <td
                                style={{
                                  fontSize: 13, textAlign: "right", paddingBottom: "3px", paddingRight: "6px"
                                }}
                              >
                                {freight?.quote_validity || ""}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          style={{
                            background: "#1b2245",
                            width: "100%",
                            color: "white",
                            fontSize: 13,
                            textAlign: "center",
                            margin: "5px 0px",
                            padding: 2,
                          }}
                        >
                          <tbody>
                            <tr>
                              <td style={{ fontSize: 13 }}>
                                Routing Details
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table style={{ width: "100%" }}>
                          <tbody>
                            <tr>
                              <td style={{ padding: "0px 6px" }}>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    <strong> Country of Origin</strong>
                                  </p>
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    {getdata?.collection_from_name}
                                  </p>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    <strong> Place of Receipt</strong>
                                  </p>
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    {getdata?.port_of_loading}
                                  </p>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    <strong>Port of Loading</strong>
                                  </p>
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    {getdata?.port_of_loading}
                                  </p>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    <strong>Port of Discharge</strong>
                                  </p>
                                  <p
                                    className="text-dark"
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    {getdata?.post_of_discharge}
                                  </p>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    <strong> Place of Delivery</strong>
                                  </p>
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    {getdata?.delivery_to_name}
                                  </p>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    <strong>Incoterm</strong>
                                  </p>
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    {getdata?.incoterm}
                                  </p>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    <strong>Mode of Transport</strong>
                                  </p>
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    {getdata?.freight}
                                  </p>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    <strong>Freight No</strong>
                                  </p>
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    {getdata?.freight_number}
                                  </p>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table
                          style={{
                            background: "#1b2245",
                            width: "100%",
                            color: "white",
                            fontSize: 13,
                            textAlign: "center",
                            margin: "5px 0px",
                            padding: 2,
                          }}
                        >
                          <tbody>
                            <tr>
                              <td style={{ fontSize: 13 }}>
                                Freight details
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <table style={{ width: "100%" }}>
                          <tbody>
                            <tr>
                              <td style={{ padding: "0px 6px" }}>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    <strong>Load type</strong>
                                  </p>
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    {getdata?.fcl_lcl}
                                  </p>
                                </div>

                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    <strong>Transit Priority</strong>
                                  </p>
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                      textTransform: "capitalize"
                                    }}
                                  >
                                    {getdata?.type}
                                  </p>
                                </div>

                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                    }}
                                  >
                                    <strong>Insurance</strong>
                                  </p>
                                  <p
                                    style={{
                                      fontSize: 13,
                                      marginBottom: "unset",
                                      marginTop: 2,
                                      textTransform: "captalize"
                                    }}
                                  >
                                    {getdata?.insurance}
                                  </p>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div className="pdf-quote-section html2pdf__page-break" style={{ pageBreakBefore: "always", breakBefore: "always" }}>
                    <table style={{ width: "100%" }}>
                      <tbody>
                        <tr>
                          <td
                            style={{ padding: 0, borderRight: "1px solid black" }}
                          >
                            <div
                              style={{
                                border: "1px solid black",
                                width: "31%",
                                borderBottom: "0px solid transparent",
                                height: 22,
                                borderTop: "unset",
                              }}
                            >
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 13,
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  paddingLeft: 5,
                                }}
                              >
                                QUOTE INFORMATION
                              </p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="table-responsive">
                      <table className="cost-table">
                        <thead>
                          <tr>
                            <th>Description</th>
                            <th>QTY</th>
                            <th>UOM</th>
                            <th>Unit</th>
                            <th>Sales/ P</th>
                            <th>Curr</th>
                            <th>Exch rate</th>
                            <th>Vat %</th>
                            <th>Disc %</th>
                            <th>Exclusive</th>
                            <th>Total</th>
                          </tr>
                        </thead>

                        <tbody>
                          {/* 1. Origin Charges */}
                          {originRows.length > 0 && (
                            <>
                              <tr className="estimate-section-row" style={{ backgroundColor: "#f0f2f5" }}>
                                <td colSpan={11}>
                                  <strong>Origin Charges</strong>
                                </td>
                              </tr>
                              {originRowsData.map(({ row, calc }) => renderRow(row, calc, setOriginRows))}
                              <tr style={{ fontWeight: "bold", backgroundColor: "#fafafa" }}>
                                <td colSpan={7}>Total - Origin Charges</td>
                                <td></td>
                                <td></td>
                                <td>{formatValue(totalOriginExclusive)}</td>
                                <td>{formatValue(totalOriginInclusive)}</td>
                              </tr>
                            </>
                          )}

                          {/* 2. Freight Charges */}
                          {freightRows.length > 0 && (
                            <>
                              <tr className="estimate-section-row" style={{ backgroundColor: "#f0f2f5" }}>
                                <td colSpan={11}>
                                  <strong>Freight Charges</strong>
                                </td>
                              </tr>
                              {freightRowsData.map(({ row, calc }) => renderRow(row, calc, setFreightRows))}
                              <tr style={{ fontWeight: "bold", backgroundColor: "#fafafa" }}>
                                <td colSpan={7}>Total - Freight Charges</td>
                                <td></td>
                                <td></td>
                                <td>{formatValue(totalFreightExclusive)}</td>
                                <td>{formatValue(totalFreightInclusive)}</td>
                              </tr>
                            </>
                          )}

                          {/* 3. Transit Charges */}
                          {transitRows.length > 0 && (
                            <>
                              <tr className="estimate-section-row" style={{ backgroundColor: "#f0f2f5" }}>
                                <td colSpan={11}>
                                  <strong>Transit Charges</strong>
                                </td>
                              </tr>
                              {transitRowsData.map(({ row, calc }) => renderRow(row, calc, setTransitRows))}
                              <tr style={{ fontWeight: "bold", backgroundColor: "#fafafa" }}>
                                <td colSpan={7}>Total - Transit Charges</td>
                                <td></td>
                                <td></td>
                                <td>{formatValue(totalTransitExclusive)}</td>
                                <td>{formatValue(totalTransitInclusive)}</td>
                              </tr>
                            </>
                          )}

                          {/* 4. Destination Charges */}
                          {destinationRows.length > 0 && (
                            <>
                              <tr className="estimate-section-row" style={{ backgroundColor: "#f0f2f5" }}>
                                <td colSpan={11}>
                                  <strong>Destination Charges</strong>
                                </td>
                              </tr>
                              {destinationRowsData.map(({ row, calc }) => renderRow(row, calc, setDestinationRows))}
                              <tr style={{ fontWeight: "bold", backgroundColor: "#fafafa" }}>
                                <td colSpan={7}>Total - Destination Charges</td>
                                <td></td>
                                <td></td>
                                <td>{formatValue(totalDestinationExclusive)}</td>
                                <td>{formatValue(totalDestinationInclusive)}</td>
                              </tr>
                            </>
                          )}

                          {/* 5. Admin Charges */}
                          {adminRows.length > 0 && (
                            <>
                              <tr className="estimate-section-row" style={{ backgroundColor: "#f0f2f5" }}>
                                <td colSpan={11}>
                                  <strong>Admin Charges</strong>
                                </td>
                              </tr>
                              {adminRowsData.map(({ row, calc }) => renderRow(row, calc, setAdminRows))}
                              <tr style={{ fontWeight: "bold", backgroundColor: "#fafafa" }}>
                                <td colSpan={7}>Total - Admin Charges</td>
                                <td></td>
                                <td></td>
                                <td>{formatValue(totalAdminExclusive)}</td>
                                <td>{formatValue(totalAdminInclusive)}</td>
                              </tr>
                            </>
                          )}

                          {/* 6. Customs Charges */}
                          {customsRows.length > 0 && (
                            <>
                              <tr className="estimate-section-row" style={{ backgroundColor: "#f0f2f5" }}>
                                <td colSpan={11}>
                                  <strong>Customs Charges</strong>
                                </td>
                              </tr>
                              {customsRowsData.map(({ row, calc }) => renderRow(row, calc, setCustomsRows))}
                              <tr style={{ fontWeight: "bold", backgroundColor: "#fafafa" }}>
                                <td colSpan={7}>Total - Customs Charges</td>
                                <td></td>
                                <td></td>
                                <td>{formatValue(totalCustomsExclusive)}</td>
                                <td>{formatValue(totalCustomsInclusive)}</td>
                              </tr>
                            </>
                          )}

                          {/* Grand Total Row */}
                          <tr style={{ fontWeight: "bold", backgroundColor: "#e2e8f0", borderTop: "2px solid #475569" }}>
                            <td colSpan={9} style={{ textAlign: "left", fontWeight: "bold", verticalAlign: "top", paddingTop: "12px", color: "black" }}>
                              GRAND TOTAL
                            </td>
                            <td style={{ padding: "8px", verticalAlign: "top", color: "black", textAlign: "left", borderRight: "none" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "13px" }}>
                                <span style={{ fontWeight: "normal" }}>Subtotal:</span>
                                <span style={{ fontWeight: "normal" }}>Discount:</span>
                                <span style={{ fontWeight: "normal" }}>Exclusive:</span>
                                <span style={{ fontWeight: "normal" }}>Vat:</span>
                                <span style={{ fontWeight: "bold", borderTop: "1px solid #475569", paddingTop: "4px" }}>Grand Total:</span>
                              </div>
                            </td>
                            <td style={{ padding: "8px", verticalAlign: "top", color: "black", textAlign: "right", borderLeft: "none" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "13px" }}>
                                <span>{formatValue(grandTotalFinalAmt)}</span>
                                <span>{grandTotalDiscount > 0 ? `-${formatValue(grandTotalDiscount)}` : "0.00"}</span>
                                <span>{formatValue(grandTotalExclusive)}</span>
                                <span>{formatValue(grandTotalVat)}</span>
                                <span style={{ fontWeight: "bold", borderTop: "1px solid #475569", paddingTop: "4px" }}>{formatValue(totalVatInclusive)}</span>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* ── Terms & Conditions ── */}
                    <table
                      style={{ width: "100%", marginTop: 20, breakInside: "avoid", pageBreakInside: "avoid", border: "1px solid black", }}
                    >
                      <tbody>
                        <tr>
                          <td style={{ padding: 0 }}>
                            <div
                              style={{
                                textAlign: "center",

                                borderBottom: "0px solid transparent",
                                height: 22,
                                borderTop: "unset",
                              }}
                            >
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 13,
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  paddingLeft: 5,
                                }}
                              >
                                TERMS & CONDITIONS
                              </p>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ border: "1px solid black", padding: "10px 12px", verticalAlign: "top" }}>
                            <div style={{ fontSize: 12, color: "#333", lineHeight: 1.6 }}>
                              <div style={{ marginBottom: 6 }}>{termsAndConditions.intro}</div>
                              {termsAndConditions.items.map((item, index) => (
                                <div key={index} style={{ marginBottom: 4 }}>
                                  {index + 1}. <strong>{item.label}</strong>: {item.text}
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* ── Banking Details — kept together; flows to the next printed page as a
                           whole block whenever there isn't enough room left on the current one ── */}
                    <div style={{ marginTop: 16, breakInside: "avoid", pageBreakInside: "avoid" }}>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Banking Details</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, maxWidth: 700 }}>
                        {[
                          ["Account Name", freight?.bank_details?.account_name],
                          ["Bank Name", freight?.bank_details?.bank_name],
                          ["Branch Code", freight?.bank_details?.branch_code],
                          ["Account Number", freight?.bank_details?.account_no],
                          ["Swift Code", freight?.bank_details?.swift_code],
                        ].map(([label, value]) => (
                          <div key={label}>
                            <div style={{ fontSize: 12, marginBottom: 4 }}>{label}</div>
                            <div style={{ borderBottom: "1px solid #ccc", height: 18, fontSize: 12, fontWeight: 500 }}>
                              {value || ""}
                            </div>
                          </div>
                        ))}
                      </div>
                      {freight?.bank_details?.note && (
                        <div style={{ marginTop: 12, fontSize: 12, color: "#666", whiteSpace: "pre-line", fontStyle: "italic", lineHeight: 1.5 }}>
                          {freight?.bank_details?.note}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* <div className="text-center mt-3">
                  <button className="ship_btn" onClick={estimateCalculate}>
                    Get Quote
                  </button>
                </div> */}
                </div>
              </section>
            </div>
          </div>
        </div >
      </div >
    </>
  );
}
