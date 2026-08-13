import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MdDownloadForOffline } from "react-icons/md";
import { usePDF } from "react-to-pdf";
import logo from "../../Assests/logo.png";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import html2pdf from "html2pdf.js";
import { useRef } from "react";

const VAT_OPTIONS = [
  { value: "", label: "No Vat" },
  { value: "Standard Rate(15.00%)", label: "Standard Rate(15.00%)" },
  { value: "Standard Rate (Capital Goods) (15.00%)", label: "Standard Rate (Capital Goods) (15.00%)" },
  { value: "Zero Rate", label: "Zero Rate" },
  { value: "Zero Rate Exports(0.00%)", label: "Zero Rate Exports(0.00%)" },
  { value: "Exempt and Non-Suppliers(0.00%)", label: "Exempt and Non-Suppliers(0.00%)" },
  { value: "Export of Second Hands Goods(15.00%)", label: "Export of Second Hands Goods(15.00%)" },
  { value: "Change in Use(15.00%)", label: "Change in Use(15.00%)" },
  { value: "Customs VAT(100.00%)", label: "Customs VAT(100.00%)" },
  { value: "Goods and Services Imported(100.00%)", label: "Goods and Services Imported(100.00%)" },
  { value: "Capital Goods and Imported(100.00%)", label: "Capital Goods and Imported(100.00%)" },
  { value: "VAT Adjustment (100.00%)", label: "VAT Adjustment (100.00%)" },
  { value: "Domestic Reverse Charge (15.00%)", label: "Domestic Reverse Charge (15.00%)" },
  { value: "Manual VAT", label: "Manual VAT" },
  { value: "Manual VAT (Capital Goods)", label: "Manual VAT (Capital Goods)" }
];

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
  if (initialQuoteEstimateId) {
    localStorage.setItem("freight_quote_estimate_id", initialQuoteEstimateId);
  }
  if (getdata122?.supplier_id) {
    localStorage.setItem("supplierid", getdata122.supplier_id);
  }

  const getFreightId = () => getdata122?.freight_id || getdata122?.id || localStorage.getItem("freightid");
  const getQuoteEstimateId = () => getdata122?.freight_quote_estimate_id || getdata122?.quote_estimate_id || localStorage.getItem("freight_quote_estimate_id");
  const getSupplierId = () => getdata122?.supplier_id || freight?.supplier_id || localStorage.getItem("supplierid");

  useEffect(() => {
    getFreightDataById();
  }, []);

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
          setFreight(mapEstimateComponentsToFlatFields(estimateData) || [0]);
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
  const freight_amount =
    freight?.origin_pick_up_entey * freight?.origin_pick_up_Unit;
  const num1 = parseFloat(freight_amount || 0);
  const num2 = parseFloat(freight.freight_gp || 0);
  const num3 = num1 / (1 - num2 / 100);
  const finalval = isNaN(num3) ? 0 : num3.toFixed(2);
  const finalvalflo = parseFloat(finalval);
  const originhandelc = (e) => {
    const { name, value } = e.target;
    setOrigin({ ...origin, [name]: value });
  };
  const oripick1 = parseFloat(freight.origin_pick_up_cost) || 0;
  // const oripick19 = parseFloat(freight.freight_charge_currencyQTY) || 0;
  // const oripick2 = parseFloat(freight.origin_pick_up_fees) || 0;
  const oripick2 =
    freight.origin_pick_up_unitType === "1" ? 1 : freight.chargable_rate;
  const oripick3 = parseFloat(freight.origin_pickup_fee_gpcalc) || 0;
  const oripick4 = freight.origin_pick_up_unitType
    ? oripick1 * oripick2 * freight.freight_charge_currencyQTY
    : 0.0;
  let finalValue = 0;
  if (oripick4 > 0) {
    finalValue = oripick4 * (1 + oripick3 / 100);
  }
  const finalori1 = isNaN(finalValue) ? "0.00" : finalValue.toFixed(2);
  const finalvlaueoriginPickup =
    finalori1 * parseInt(freight?.roe_origin_currencyorigin);
  const orifuel1 = parseFloat(freight.origin_pick_up_fuel_cost) || 0;
  // const orifuel2 = parseFloat(freight.origin_pick_up_fuel_fees) || 0;
  const orifuel2 =
    freight.origin_pick_up_fuel_unitType === "1" ? 1 : freight.chargable_rate;
  const orifuel3 = parseFloat(freight.origin_pick_fuelGP) || 0;
  const orifuel4 = freight.origin_pick_up_fuel_unitType
    ? orifuel1 * orifuel2 * freight.origin_pick_up_fuel_unitTypeQTY
    : 0.0;
  let finalValueFuel = 0;
  if (orifuel4 > 0) {
    finalValueFuel = orifuel4 * (1 + orifuel3 / 100);
  }
  const finalfuel1 = isNaN(finalValueFuel) ? "0.00" : finalValueFuel.toFixed(2);
  const finalvlaueoFuel =
    finalfuel1 * parseInt(freight?.roe_origin_fuel_currency);
  const oricfs1 = parseFloat(freight.origin_pick_up_cfs_cost) || 0;
  // const oricfs2 = parseFloat(freight.origin_pick_up_cfs_fees) || 0;
  const oricfs2 = parseFloat(
    freight.origin_pick_up_cfs_unitType === "1" ? 1 : freight.chargable_rate
  );
  const oricfs3 = parseFloat(freight.origin_pickup_vfs_gp) || 0;
  const oricfs4 = freight.origin_pick_up_cfs_unitType
    ? oricfs1 * oricfs2 * freight.origin_pick_up_cfs_unitTypeQTY
    : 0.0;
  let finalValuecfs = 0;
  if (oricfs4 > 0) {
    finalValuecfs = oricfs4 * (1 + oricfs3 / 100);
  }
  const finalcfs1 = isNaN(finalValuecfs) ? "0.00" : finalValuecfs.toFixed(2);
  const finalvlaueocfs = finalcfs1 * parseInt(freight?.roe_origin_cfs_currency);

  const oridoc1 = parseFloat(freight.origin_pick_up_documantion_cost) || 0;
  // const oridoc2 = parseFloat(freight.origin_pick_up_documantation_fees) || 0;
  const oridoc2 = parseFloat(
    freight.origin_pick_up_documantation_unitType === "1"
      ? 1
      : freight.chargable_rate
  );
  const oridoc3 = parseFloat(freight.origin_pick_documantation_cost_gp) || 0;
  const oridoc4 = freight.origin_pick_up_documantation_unitType
    ? oridoc1 * oridoc2 * freight.origin_pick_up_documantation_unitTypeQTY
    : 0.0;
  let finalValuedoc = 0;
  if (oridoc4 > 0) {
    finalValuedoc = oridoc4 * (1 + oridoc3 / 100);
  }
  console.log(oridoc4);
  const finaldoc1 = isNaN(finalValuedoc) ? "0.00" : finalValuedoc.toFixed(2);
  console.log(finaldoc1, "finaldoc1");
  console.log(freight.roe_origin_doc_currency);
  console.log(parseInt(freight?.roe_origin_doc_currency));
  const finalvlaueodoc = finaldoc1 * parseInt(freight?.roe_origin_doc_currency);

  const oriforewarding1 =
    parseFloat(freight.origin_pick_up_forewarding_cost) || 0;
  const oriforewarding2 = parseFloat(
    freight.origin_pick_up_forewarding_unitType === "1"
      ? 1
      : freight.chargable_rate
  );
  // const oriforewarding2 =
  //   parseFloat(freight.origin_pick_up_forewarding_fees) || 0;
  const oriforewarding3 = parseFloat(freight.origin_pickup_forewarding_gp) || 0;
  const oriforewarding4 = freight.origin_pick_up_forewarding_unitType
    ? oriforewarding1 *
    oriforewarding2 *
    freight.origin_pick_up_forewarding_unitTypeQTY
    : 0.0;
  let finalValueforewarding = 0;
  if (oriforewarding4 > 0) {
    finalValueforewarding = oriforewarding4 * (1 + oriforewarding3 / 100);
  }
  console.log(oriforewarding4);
  const finalforewarding1 = isNaN(finalValueforewarding)
    ? "0.00"
    : finalValueforewarding.toFixed(2);
  console.log(finalforewarding1, "finalforewarding1");
  console.log(freight.roe_origin_forewarding);
  console.log(parseInt(freight?.roe_origin_forewarding));
  const finalvlaueoforewarding =
    finalforewarding1 * parseInt(freight?.roe_origin_forewarding);
  const oricustome1 = parseFloat(freight.origin_pick_up_custome_cost) || 0;
  const oricustome2 = parseFloat(
    freight.origin_pick_up_custome_unitType === "1" ? 1 : freight.chargable_rate
  );
  const oricustome3 = parseFloat(freight.origin_pickup_custome_gp) || 0;
  const oricustome4 = freight.origin_pick_up_custome_unitType
    ? oricustome1 * oricustome2 * freight.origin_pick_up_custome_unitTypeQTY
    : 0.0;
  let finalValuecustome = 0;
  if (oricustome4 > 0) {
    finalValuecustome = oricustome4 * (1 + oricustome3 / 100);
  }
  console.log(oriforewarding4);
  const finalcustomes1 = isNaN(finalValuecustome)
    ? "0.00"
    : finalValuecustome.toFixed(2);
  console.log(finalcustomes1, "finalcustomes1");
  console.log(freight.roe_origin_customes);
  console.log(parseInt(freight?.roe_origin_customes));
  const finalvlaueoCustomes =
    finalcustomes1 * parseInt(freight?.roe_origin_customes);
  const safeNumber = (val) => {
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };
  const totalChageswithOutExchange =
    safeNumber(finalori1) +
    safeNumber(finalfuel1) +
    safeNumber(finalcfs1) +
    safeNumber(finaldoc1) +
    safeNumber(finalforewarding1) +
    safeNumber(finalcustomes1);
  console.log(totalChageswithOutExchange);
  const totalChangeRoeOrigin =
    safeNumber(finalvlaueoriginPickup) +
    safeNumber(finalvlaueoFuel) +
    safeNumber(finalvlaueocfs) +
    safeNumber(finalvlaueodoc) +
    safeNumber(finalvlaueoCustomes) +
    safeNumber(finalvlaueoforewarding);

  const formatValue = (val) => {
    const num = parseFloat(val);
    if (isNaN(num) || num === 0) return "-";
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const calculateRowVatAndDisc = (total, vatTyp, discPercentVal) => {
    const totalVal = parseFloat(total) || 0;
    const discPercent = parseFloat(discPercentVal) || 0;
    const vatPercent = getVatPercent(vatTyp);

    const discount = (totalVal * discPercent) / 100;
    const exclusive = totalVal - discount;
    const vat = (exclusive * vatPercent) / 100;
    const inclusive = exclusive + vat;

    return {
      discount,
      exclusive,
      vat,
      inclusive
    };
  };

  const pickUpCalc = calculateRowVatAndDisc(finalvlaueoriginPickup, freight?.org_pickUp_vatTyp, freight?.["org_pickUp_disc%"]);
  const fuelCalc = calculateRowVatAndDisc(finalvlaueoFuel, "", 0);
  const cfsCalc = calculateRowVatAndDisc(finalvlaueocfs, "", 0);
  const docCalc = calculateRowVatAndDisc(finalvlaueodoc, "", 0);
  const forwardingCalc = calculateRowVatAndDisc(finalvlaueoforewarding, "", 0);
  const customsCalc = calculateRowVatAndDisc(finalvlaueoCustomes, "", 0);

  const totalOriginDiscount = pickUpCalc.discount + fuelCalc.discount + cfsCalc.discount + docCalc.discount + forwardingCalc.discount + customsCalc.discount;
  const totalOriginExclusive = pickUpCalc.exclusive + fuelCalc.exclusive + cfsCalc.exclusive + docCalc.exclusive + forwardingCalc.exclusive + customsCalc.exclusive;
  const totalOriginVat = pickUpCalc.vat + fuelCalc.vat + cfsCalc.vat + docCalc.vat + forwardingCalc.vat + customsCalc.vat;
  // ////////////////////////////freight calculation
  const orifreight1 = parseFloat(freight.freight_charge_currency_cost) || 0;
  // const orifreight2 = parseFloat(freight.freight_charge_currency_fees) || 0;
  const orifreight2 = parseFloat(
    freight.freight_charge_currency_unitType === "1"
      ? 1
      : freight.chargable_rate
  );
  const orifreight3 = parseFloat(freight.freight_charge_currency_gp) || 0;
  const orifreight4 = freight.freight_charge_currency_unitType
    ? orifreight1 * orifreight2 * freight.freight_charge_currency_unitTypeQTY
    : 0.0;
  let finalValuefreight = 0;
  if (orifreight4 > 0) {
    console.log(orifreight4);
    finalValuefreight = orifreight4 * (1 + orifreight3 / 100);
  }
  console.log(orifreight4);
  const finalfreight1 = isNaN(finalValuefreight)
    ? "0.00"
    : finalValuefreight.toFixed(2);
  const finalvlaueofreight =
    finalfreight1 * parseInt(freight?.roe_freight_currency);
  const oriinsurance1 =
    parseFloat(freight.freight_currency_insurance_cost) || 0;
  const oriindsurance2 = parseFloat(
    freight.freight_currency_insurance_unittype === "1"
      ? 1
      : freight.chargable_rate
  );
  // const oriindsurance2 =
  //   parseFloat(freight.freight_currency_insurance_unit) || 0;
  const oriinsurance3 = parseFloat(freight.freightorigin_insurance_gp) || 0;
  const oriinsurance4 = freight.freight_currency_insurance_unittype
    ? oriinsurance1 *
    oriindsurance2 *
    freight.freight_currency_insurance_unittypeQTY
    : 0.0;
  let finalValueinsurance = 0;
  if (oriinsurance4 > 0) {
    finalValueinsurance = oriinsurance4 * (1 + oriinsurance3 / 100);
  }
  console.log(oriinsurance4);
  const finalinsurance1 = isNaN(finalValueinsurance)
    ? "0.00"
    : finalValueinsurance.toFixed(2);
  console.log(finalfreight1, "finalfreight1");
  console.log(freight.roe_insurance_currency);
  console.log(parseInt(freight?.roe_insurance_currency));
  const finalvlaueoInsurance =
    finalinsurance1 * parseInt(freight?.roe_insurance_currency);
  console.log(finalvlaueoFuel, "finalvlaueoFuel");
  console.log(orifuel1, orifuel3, orifuel4, finalValueFuel, finalvlaueoFuel);

  const totalChageswithOutExchangeinsurance =
    safeNumber(finalValuefreight) + safeNumber(finalValueinsurance);

  console.log(totalChageswithOutExchangeinsurance);

  const totalChangeRoeOriginaftercalcuinsurance =
    safeNumber(finalvlaueoInsurance) + safeNumber(finalvlaueofreight);

  ///////////////////////////////transit change/////////////////////////////////////////////

  const oritransit1 = parseFloat(freight.Transit_currency_Cost) || 0;
  // const oritransit2 = parseFloat(freight.Transit_currency_unit) || 0;
  const oritransit2 = parseFloat(
    freight.Transit_currency_unitTpe === "1" ? 1 : freight.chargable_rate
  );
  const oritransit3 = parseFloat(freight.Transit_currency_gp) || 0;
  const oritransit4 = freight.Transit_currency_unitTpe
    ? oritransit1 * oritransit2 * freight.Transit_currency_unitTpeQTY
    : 0.0;
  let finalValuetransit = 0;
  if (oritransit4 > 0) {
    finalValuetransit = oritransit4 * (1 + oritransit3 / 100);
  }
  console.log(oriinsurance4);
  const finaltransit1 = isNaN(finalValuetransit)
    ? "0.00"
    : finalValuetransit.toFixed(2);
  const finalvlaueotransit =
    finaltransit1 * parseInt(freight?.Transit_currency_roe);

  const oriThc1 = parseFloat(freight.transit_currency_THC_cost) || 0;
  // const oriThc2 = parseFloat(freight.transit_currency_THC_init) || 0;
  const oriThc2 = parseFloat(
    freight.transit_currency_THC_initType === "1" ? 1 : freight.chargable_rate
  );
  const oriThc3 = parseFloat(freight.transit_currency_THC_gp) || 0;
  const oriThc4 = freight.transit_currency_THC_initType
    ? oriThc1 * oriThc2 * freight.transit_currency_THC_initTypeQTY
    : 0.0;
  let finalValueThc = 0;
  if (oriThc4 > 0) {
    finalValueThc = oriThc4 * (1 + oriThc3 / 100);
  }
  const finalThc1 = isNaN(finalValueThc) ? "0.00" : finalValueThc.toFixed(2);
  const finalvlaueotfineal = finalThc1 * parseInt(freight?.roe_Transit_Thc);

  const oriunpack1 = parseFloat(freight.Transit_currency_unpack_cost) || 0;
  const oriunpack2 = parseFloat(
    freight.Transit_currency_unpack_unitType === "1"
      ? 1
      : freight.chargable_rate
  );
  // const oriunpack2 = parseFloat(freight.Transit_currency_unpack_unit) || 0;
  const oriunpack3 = parseFloat(freight.Transit_currency_unpack_gp) || 0;
  const oriunpack4 = freight.Transit_currency_unpack_unitType
    ? oriunpack1 * oriunpack2 * freight.transit_currency_THC_initTypeeQTY
    : 0.0;
  let finalValueUnpack = 0;
  if (oriunpack4 > 0) {
    finalValueUnpack = oriunpack4 * (1 + oriunpack3 / 100);
  }
  const finalunpack1 = isNaN(finalValueUnpack)
    ? "0.00"
    : finalValueUnpack.toFixed(2);
  const finalvlaueotfunpack =
    finalunpack1 * parseInt(freight?.Transit_unpack_roe);

  const ori3rdparty1 = parseFloat(freight.transit_3rd_party_cost) || 0;
  // const ori3rdparty2 = parseFloat(freight.transit_3rd_party_unit) || 0;
  const ori3rdparty2 = parseFloat(
    freight.transit_3rd_party_unittype === "1" ? 1 : freight.chargable_rate
  );
  const ori3rdparty3 = parseFloat(freight.transit_3rd_party_gp) || 0;
  const ori3rdparty4 = freight.transit_3rd_party_unittype
    ? ori3rdparty1 * ori3rdparty2 * freight.transit_3rd_party_unittypeQTY
    : 0.0;
  let finalValue3rdparty = 0;
  if (ori3rdparty4 > 0) {
    finalValue3rdparty = ori3rdparty4 * (1 + ori3rdparty3 / 100);
  }
  const final3rdparty1 = isNaN(finalValue3rdparty)
    ? "0.00"
    : finalValue3rdparty.toFixed(2);
  const finalvlaueot3dparty =
    final3rdparty1 * parseInt(freight?.transit_currency_3rd);

  const ori3rdAdmin1 = parseFloat(freight.transit_admin_change) || 0;
  // const ori3rdAdmin2 = parseFloat(freight.transit_admin_unit) || 0;
  const ori3rdAdmin2 = parseFloat(
    freight.transit_admin_unittype === "1" ? 1 : freight.chargable_rate
  );
  const ori3rdAdmin3 = parseFloat(freight.transit_admin_gp) || 0;
  const ori3rdAdmin4 = freight.transit_admin_unittype
    ? ori3rdAdmin1 * ori3rdAdmin2 * freight.transit_admin_unittypeQTY
    : 0.0;
  let finalValueAdmin = 0;
  if (ori3rdAdmin4 > 0) {
    finalValueAdmin = ori3rdAdmin4 * (1 + ori3rdAdmin3 / 100);
  }
  const final3rdAdmin1 = isNaN(finalValueAdmin)
    ? "0.00"
    : finalValueAdmin.toFixed(2);
  const finalvlaueotAdmin =
    final3rdAdmin1 * parseInt(freight?.roe_transit_admin);

  const ori3rdport1 = parseFloat(freight.transit_currency_port) || 0;
  const ori3rdport2 = parseFloat(
    freight.transit_currency_port_unitType === "1" ? 1 : freight.chargable_rate
  );
  const ori3rdport3 = parseFloat(freight.transit_currency_port_gp) || 0;
  const ori3rdport4 = freight.transit_currency_port_unitType
    ? ori3rdport1 * ori3rdport2 * freight.transit_currency_port_unitTypeQTY
    : 0.0;
  let finalValueport = 0;
  if (ori3rdport4 > 0) {
    finalValueport = ori3rdport4 * (1 + ori3rdport3 / 100);
  }
  const final3rdport1 = isNaN(finalValueport)
    ? "0.00"
    : finalValueport.toFixed(2);
  const finalvlaueotPort = final3rdport1 * parseInt(freight?.roe_trans_port);

  const oriadv1 = parseFloat(freight.Transit_advanced_load) || 0;
  // const oriadv2 = parseFloat(freight.Transit_advanced_unit) || 0;
  const oriadv2 = parseFloat(
    freight.Transit_advanced_unitType === "1" ? 1 : freight.chargable_rate
  );
  const oriadv3 = parseFloat(freight.Transit_advanced_gp) || 0;
  const oriadv4 = freight.Transit_advanced_unitType
    ? oriadv1 * oriadv2 * freight.Transit_advanced_unitTypeQTY
    : 0.0;
  let finalValueadv = 0;
  if (oriadv4 > 0) {
    finalValueadv = oriadv4 * (1 + oriadv3 / 100);
  }
  const final3rdadv1 = isNaN(finalValueadv) ? "0.00" : finalValueadv.toFixed(2);
  const finalvlaueotadv =
    final3rdadv1 * parseInt(freight?.Transit_advanced_gp_roe);

  const oridocumentation1 =
    parseFloat(freight.transit_change_Documentation) || 0;
  // const oridocumentation2 =
  //   parseFloat(freight.transit_change_Documentation_unit) || 0;
  const oridocumentation2 = parseFloat(
    freight.transit_change_Documentation_unitType === "1"
      ? 1
      : freight.chargable_rate
  );
  const oridocumentation3 =
    parseFloat(freight.transit_change_Documentation_gp) || 0;
  const oridocumentation4 = freight.transit_change_Documentation_unitType
    ? oridocumentation1 *
    oridocumentation2 *
    freight.transit_change_Documentation_unitTypeQTY
    : 0.0;
  let finalValuedocumantation = 0;
  if (oridocumentation4 > 0) {
    finalValuedocumantation = oridocumentation4 * (1 + oridocumentation3 / 100);
  }
  const final3rdocumantation1 = isNaN(finalValuedocumantation)
    ? "0.00"
    : finalValuedocumantation.toFixed(2);
  const finalvlaueotDocumantation =
    final3rdocumantation1 * parseInt(freight?.roe_transit_change_Documentation);

  const totalChageswithOuTransit =
    safeNumber(oritransit4) +
    safeNumber(oriunpack4) +
    safeNumber(ori3rdparty4) +
    safeNumber(ori3rdAdmin4) +
    safeNumber(ori3rdport4) +
    safeNumber(oridocumentation4) +
    safeNumber(oriadv4) +
    safeNumber(oriThc4);

  console.log(totalChageswithOutExchangeinsurance);

  const transitRoe =
    safeNumber(finalvlaueotDocumantation) +
    safeNumber(finalvlaueotransit) +
    safeNumber(finalvlaueotadv) +
    safeNumber(finalvlaueotfineal) +
    safeNumber(finalvlaueotfunpack) +
    safeNumber(finalvlaueot3dparty) +
    safeNumber(finalvlaueotAdmin) +
    safeNumber(finalvlaueotPort);

  // ////////////////////////////////////destination charge////////////////////////

  const destinationdocumentation1 =
    parseFloat(freight.Destination_freight_currency_cost) || 0;
  // const destinationdocumentation2 =
  //   parseFloat(freight.Destination_freight_currency_unit) || 0;
  const destinationdocumentation2 = parseFloat(
    freight.Destination_freight_currency_unitType === "1"
      ? 1
      : freight.chargable_rate
  );
  const destinationdocumentation3 =
    parseFloat(freight.Destination_freight_currency_gp) || 0;
  const destinationdocumentation4 =
    freight.Destination_freight_currency_unitType
      ? destinationdocumentation1 *
      destinationdocumentation2 *
      freight.Destination_freight_currency_unitTypeQTY
      : 0.0;
  let finalValuedestanion = 0;
  if (destinationdocumentation4 > 0) {
    finalValuedestanion =
      destinationdocumentation4 * (1 + destinationdocumentation3 / 100);
  }
  const final3rdestination1 = isNaN(finalValuedestanion)
    ? "0.00"
    : finalValuedestanion.toFixed(2);
  const final3rdestinationRoe =
    final3rdestination1 * parseInt(freight?.Destination_freight_currency_Roe);

  const destinationTHCdocumentation1 =
    parseFloat(freight.Destination_THC_currency_cost) || 0;
  // const destinationTHCdocumentation2 =
  //   parseFloat(freight.Destination_THC_currency_unit) || 0;
  const destinationTHCdocumentation2 = parseFloat(
    freight.Destination_THC_currency_unitType === "1"
      ? 1
      : freight.chargable_rate
  );
  const destinationTHCdocumentation3 =
    parseFloat(freight.Destination_THC_currency_gp) || 0;
  const destinationTHCdocumentation4 = freight.Destination_THC_currency_unitType
    ? destinationTHCdocumentation1 *
    destinationTHCdocumentation2 *
    freight.Destination_THC_currency_unitTypeQTY
    : 0.0;
  let finalValueTHCdestanion = 0;
  if (destinationTHCdocumentation4 > 0) {
    finalValueTHCdestanion =
      destinationTHCdocumentation4 * (1 + destinationTHCdocumentation3 / 100);
  }
  const final3rTHCdestination1 = isNaN(finalValueTHCdestanion)
    ? "0.00"
    : finalValueTHCdestanion.toFixed(2);
  const final3rTHCdestinationRoe =
    final3rTHCdestination1 * parseInt(freight?.Destination_THC_currency_Roe);

  const destinationUnpackdocumentation1 =
    parseFloat(freight.Destination_Unpack_currency_cost) || 0;
  // const destinationUnpackdocumentation2 =
  //   parseFloat(freight.Destination_Unpack_currency_unit) || 0;
  const destinationUnpackdocumentation2 = parseFloat(
    freight.Destination_Unpack_currency_unitType === "1"
      ? 1
      : freight.chargable_rate
  );
  const destinationUnpackdocumentation3 =
    parseFloat(freight.Destination_Unpack_currency_gp) || 0;
  const destinationUnpackdocumentation4 =
    freight.Destination_Unpack_currency_unitType
      ? destinationUnpackdocumentation1 *
      destinationUnpackdocumentation2 *
      freight.Destination_Unpack_currency_unitTypeQTY
      : 0.0;
  let finalValueUnpackdestanion = 0;
  if (destinationUnpackdocumentation4 > 0) {
    finalValueUnpackdestanion =
      destinationUnpackdocumentation4 *
      (1 + destinationUnpackdocumentation3 / 100);
  }
  const final3runpackdestination1 = isNaN(finalValueUnpackdestanion)
    ? "0.00"
    : finalValueUnpackdestanion.toFixed(2);
  const final3rUnpackdestinationRoe =
    final3runpackdestination1 *
    parseInt(freight?.Destination_Unpack_currency_roe);

  const destinationfuelsurchargedocumentation1 =
    parseFloat(freight.Destination_fuelsurcharge_currency_cost) || 0;
  // const destinationfuelsurchargedocumentation2 =
  // parseFloat(freight.Destination_fuelsurcharge_currency_unit) || 0;
  const destinationfuelsurchargedocumentation2 = parseFloat(
    freight.Destination_fuelsurcharge_currency_typeUnit === "1"
      ? 1
      : freight.chargable_rate
  );
  const destinationfuelsurchargedocumentation3 =
    parseFloat(freight.Destination_fuelsurcharge_currency_gp) || 0;
  const destinationfuelsurchargedocumentation4 =
    freight.Destination_fuelsurcharge_currency_typeUnit
      ? destinationfuelsurchargedocumentation1 *
      destinationfuelsurchargedocumentation2 *
      freight.Destination_fuelsurcharge_currency_typeUnitQTY
      : 0.0;
  let finalValueFulesurchargedestanion = 0;
  if (destinationfuelsurchargedocumentation4 > 0) {
    finalValueFulesurchargedestanion =
      destinationfuelsurchargedocumentation4 *
      (1 + destinationfuelsurchargedocumentation3 / 100);
  }
  const final3rfuelsurchargedestination1 = isNaN(
    finalValueFulesurchargedestanion
  )
    ? "0.00"
    : finalValueFulesurchargedestanion.toFixed(2);
  const final3rfuelsurCahrgeestinationRoe =
    final3rfuelsurchargedestination1 *
    parseInt(freight?.Destination_fuelsurcharge_currency_roe);

  const destinatiadminsurcharge1 =
    parseFloat(freight.Destination_adminsurcharge_currency_cost) || 0;
  const destinatiadminsurcharge2 = parseFloat(
    freight.Destination_adminsurcharge_currency_unitType === "1"
      ? 1
      : freight.chargable_rate
  );
  // const destinatiadminsurcharge2 =
  //   parseFloat(freight.Destination_adminsurcharge_currency_unit) || 0;
  const destinatiadminsurcharge3 =
    parseFloat(freight.Destination_adminsurcharge_currency_gp) || 0;
  const destinatiadminsurcharge4 =
    freight.Destination_adminsurcharge_currency_unitType
      ? destinatiadminsurcharge1 *
      destinatiadminsurcharge2 *
      freight.Destination_adminsurcharge_currency_unitTypeQTY
      : 0.0;
  let finalValueadminsurchargedestanion = 0;
  if (destinatiadminsurcharge4 > 0) {
    finalValueadminsurchargedestanion =
      destinatiadminsurcharge4 * (1 + destinatiadminsurcharge3 / 100);
  }
  const Valueadminsurchargedestanion = isNaN(finalValueadminsurchargedestanion)
    ? "0.00"
    : finalValueadminsurchargedestanion.toFixed(2);
  const adminsurcharge2 =
    Valueadminsurchargedestanion *
    parseInt(freight?.Destination_adminsurcharge_currency_roe);

  const destinatiportcargo1 =
    parseFloat(freight.Destination_portcargo_currency_cost) || 0;
  const destinatiportcargo2 = parseFloat(
    freight.Destination_portcargo_currency_unitType === "1"
      ? 1
      : freight.chargable_rate
  );
  // const destinatiportcargo2 =
  //   parseFloat(freight.Destination_portcargo_currency_unit) || 0;
  const destinatiportcargo3 =
    parseFloat(freight.Destination_portcargo_currency_gp) || 0;
  const destinatiportcargo4 = freight.Destination_portcargo_currency_unitType
    ? destinatiportcargo1 *
    destinatiportcargo2 *
    freight.Destination_portcargo_currency_unitTypeQTY
    : 0.0;
  let finalValueportcargostanion = 0;
  if (destinatiportcargo4 > 0) {
    finalValueportcargostanion =
      destinatiportcargo4 * (1 + destinatiportcargo3 / 100);
  }
  const Vaportcargoion = isNaN(finalValueportcargostanion)
    ? "0.00"
    : finalValueportcargostanion.toFixed(2);
  const admiportcargo2 =
    Vaportcargoion * parseInt(freight?.Destination_portcargo_currency_roe);

  const destinatiAdvancedLoad1 =
    parseFloat(freight.Destination_AdvancedLoad_currency_cost) || 0;
  // const destinatiAdvancedLoad2 =
  //   parseFloat(freight.Destination_AdvancedLoad_currency_unit) || 0;
  const destinatiAdvancedLoad2 = parseFloat(
    freight.Destination_AdvancedLoad_currency_unitType === "1"
      ? 1
      : freight.chargable_rate
  );
  const destinatiAdvancedLoad3 =
    parseFloat(freight.Destination_AdvancedLoad_currency_gp) || 0;
  const destinatiAdvancedLoad4 =
    destinatiAdvancedLoad1 *
    destinatiAdvancedLoad2 *
    freight.Destination_AdvancedLoad_currency_unitTypeQTY;
  let finalValueAdvancedLoadstanion = 0;
  if (destinatiAdvancedLoad4 > 0) {
    finalValueAdvancedLoadstanion =
      destinatiAdvancedLoad4 * (1 + destinatiAdvancedLoad3 / 100);
  }
  const VAdvancedLoadion = isNaN(finalValueAdvancedLoadstanion)
    ? "0.00"
    : finalValueAdvancedLoadstanion.toFixed(2);
  const desdvancedLoadion =
    VAdvancedLoadion * parseInt(freight?.Destination_AdvancedLoad_currency_roe);

  const destinati3rdpartyDesc1 =
    parseFloat(freight.Destination_3rdpartyDesc_currency_cost) || 0;
  const destinati3rdpartyDesc2 =
    // parseFloat(freight.Destination_3rdpartyDesc_currency_unit) || 0;
    parseFloat(
      freight.Destination_3rdpartyDesc_currency_unitType === "1"
        ? 1
        : freight.chargable_rate
    );
  const destinati3rdpartyDesc3 =
    parseFloat(freight.Destination_3rdpartyDesc_currency_gp) || 0;
  const destinati3rdpartyload4 =
    freight.Destination_3rdpartyDesc_currency_unitType
      ? destinati3rdpartyDesc1 *
      destinati3rdpartyDesc2 *
      freight.Destination_3rdpartyDesc_currency_unitTypeQTY
      : 0.0;
  let finalValue3rdpartyloadstanion = 0;
  if (destinati3rdpartyload4 > 0) {
    finalValue3rdpartyloadstanion =
      destinati3rdpartyload4 * (1 + destinati3rdpartyDesc3 / 100);
  }
  const VAdvanced3rdpartyLoadion = isNaN(finalValue3rdpartyloadstanion)
    ? "0.00"
    : finalValue3rdpartyloadstanion.toFixed(2);
  const desdva3rdpartyion =
    VAdvanced3rdpartyLoadion *
    parseInt(freight?.Destination_3rdpartyDesc_currency_roe);

  const destindeliveryyDesc1 =
    parseFloat(freight.Destination_delivery_currency_cost) || 0;
  const destindeliveryyDesc2 =
    // parseFloat(freight.Destination_delivery_currency_unit) || 0;
    parseFloat(
      freight.Destination_delivery_currency_unitType === "1"
        ? 1
        : freight.chargable_rate
    );

  const destindeliveryyDesc3 =
    parseFloat(freight.Destination_delivery_currency_gp) || 0;
  const destindeliveryyDesc4 = freight.Destination_delivery_currency_unitType
    ? destindeliveryyDesc1 *
    destindeliveryyDesc2 *
    freight.Destination_delivery_currency_unitTypeQTY
    : 0.0;
  let finaldeliveryrtyloadstanion = 0;
  if (destindeliveryyDesc4 > 0) {
    finaldeliveryrtyloadstanion =
      destindeliveryyDesc4 * (1 + destindeliveryyDesc3 / 100);
  }
  const VAdvandeliverytyLoadion = isNaN(finaldeliveryrtyloadstanion)
    ? "0.00"
    : finaldeliveryrtyloadstanion.toFixed(2);
  const desddeliverytyion =
    VAdvandeliverytyLoadion *
    parseInt(freight?.Destination_delivery_currency_roe);

  const destindfuelchangerDesc1 =
    parseFloat(freight.Destination_fuelcharge_currency_cost) || 0;
  const destindfuelchangerDesc2 =
    // parseFloat(freight.Destination_fuelcharge_currency_unit) || 0;
    parseFloat(
      freight.Destination_fuelcharge_currency_unitType === "1"
        ? 1
        : freight.chargable_rate
    );
  const destindfuelchangerDesc3 =
    parseFloat(freight.Destination_fuelcharge_currency_gp) || 0;
  const destindfuelchangerDesc4 =
    freight.Destination_fuelcharge_currency_unitType
      ? destindfuelchangerDesc1 *
      destindfuelchangerDesc2 *
      freight.Destination_fuelcharge_currency_unitTypeQTY
      : 0.0;
  let finalfuelchangertyloadstanion = 0;
  if (destindfuelchangerDesc4 > 0) {
    finalfuelchangertyloadstanion =
      destindfuelchangerDesc4 * (1 + destindfuelchangerDesc3 / 100);
  }
  const VAdvfuelchangeon = isNaN(finalfuelchangertyloadstanion)
    ? "0.00"
    : finalfuelchangertyloadstanion.toFixed(2);
  const defuelchangyion =
    VAdvfuelchangeon * parseInt(freight?.Destination_fuelcharge_currency_roe);

  const totalChaDestinationTransit =
    safeNumber(destinationdocumentation4) +
    safeNumber(destinationTHCdocumentation4) +
    safeNumber(destinationUnpackdocumentation4) +
    safeNumber(destinationfuelsurchargedocumentation4) +
    safeNumber(destinatiadminsurcharge4) +
    safeNumber(destinatiportcargo4) +
    safeNumber(destinatiAdvancedLoad4) +
    safeNumber(destinati3rdpartyload4) +
    safeNumber(destindeliveryyDesc4) +
    safeNumber(destindfuelchangerDesc4);

  console.log(totalChageswithOutExchangeinsurance);

  const totalChaDestinationTransitRoe =
    safeNumber(finalvlaueotDocumantation) +
    safeNumber(final3rdestinationRoe) +
    safeNumber(final3rTHCdestinationRoe) +
    safeNumber(final3rUnpackdestinationRoe) +
    safeNumber(final3rfuelsurCahrgeestinationRoe) +
    safeNumber(adminsurcharge2) +
    safeNumber(admiportcargo2) +
    safeNumber(desdvancedLoadion) +
    safeNumber(desdva3rdpartyion) +
    safeNumber(desddeliverytyion);

  // /////////////////////////////////admin calculation/////////////////////////////

  const deadminAgencyesc1 =
    parseFloat(freight.Destination_AdminAgrncy_currency_cost) || 0;
  const deadminAgencyesc2 =
    // parseFloat(freight.Destination_AdminAgrncy_currency_unit) || 0;
    parseFloat(
      freight.Destination_AdminAgrncy_currency_unitType === "1"
        ? 1
        : freight.chargable_rate
    );
  const deadminAgencyesc3 =
    parseFloat(freight.Destination_AdminAgrncy_currency_gp) || 0;
  const deadminAgencyesc4 = freight.Destination_AdminAgrncy_currency_unitType
    ? deadminAgencyesc1 *
    deadminAgencyesc2 *
    freight.Destination_AdminAgrncy_currency_unitQTY
    : 0.0;
  let finaldminAgencyestanion = 0;
  if (deadminAgencyesc4 > 0) {
    finaldminAgencyestanion = deadminAgencyesc4 * (1 + deadminAgencyesc3 / 100);
  }
  const VAadminAgencyngeon = isNaN(finaldminAgencyestanion)
    ? "0.00"
    : finaldminAgencyestanion.toFixed(2);
  const defuelchdminAgencyngangyion =
    VAadminAgencyngeon *
    parseInt(freight?.Destination_AdminAgrncy_currency_roe);

  const deaddisbursemantc1 =
    parseFloat(freight.Destination_disbursemant_currency_cost) || 0;
  const deaddisbursemantc2 =
    // parseFloat(freight.Destination_disbursemant_currency_unit) || 0;
    parseFloat(
      freight.Destination_AdminAgrncy_currency_unitType === "1"
        ? 1
        : freight.chargable_rate
    );
  const deaddisbursemantc3 =
    parseFloat(freight.Destination_disbursemant_currency_gp) || 0;
  const deaddisbursemantc4 = freight.Destination_AdminAgrncy_currency_unitType
    ? deaddisbursemantc1 *
    deaddisbursemantc2 *
    freight.Destination_disbursemant_currency_unitTypeQTY
    : 0.0;
  let finaladdisbursematanion = 0;
  if (deaddisbursemantc4 > 0) {
    finaladdisbursematanion =
      deaddisbursemantc4 * (1 + deaddisbursemantc3 / 100);
  }
  const VAdisbursemon = isNaN(finaladdisbursematanion)
    ? "0.00"
    : finaladdisbursematanion.toFixed(2);
  const dedisbursementon =
    VAdisbursemon * parseInt(freight?.Destination_disbursemant_currency_roe);

  const deadoctc1 = parseFloat(freight.Destination_doc_currency_cost) || 0;
  const deadoctc2 = parseFloat(
    freight.Destination_doc_currency_unittype === "1"
      ? 1
      : freight.chargable_rate
  );
  // const deadoctc2 = parseFloat(freight.Destination_doc_currency_unit) || 0;
  const deadoctc3 = parseFloat(freight.Destination_doc_currency_gp) || 0;
  const deadoctc4 = freight.Destination_doc_currency_unittype
    ? deadoctc1 * deadoctc2 * freight.Destination_doc_currency_unittypeQTY
    : 0.0;
  let finaadoctnion = 0;
  if (deadoctc4 > 0) {
    finaadoctnion = deadoctc4 * (1 + deadoctc3 / 100);
  }
  const VAdocon = isNaN(finaadoctnion) ? "0.00" : finaadoctnion.toFixed(2);
  const dedisbudoon = VAdocon * parseInt(freight?.Destination_doc_currency_roe);

  const totaAdminransit =
    safeNumber(deadminAgencyesc4) +
    safeNumber(deaddisbursemantc4) +
    safeNumber(deadoctc4);

  console.log(totalChageswithOutExchangeinsurance);

  const totalAdminnsitRoe =
    safeNumber(defuelchdminAgencyngangyion) +
    safeNumber(dedisbursementon) +
    safeNumber(dedisbudoon);

  const sumofall =
    totaAdminransit +
    totalChaDestinationTransit +
    totalChageswithOuTransit +
    totalChageswithOutExchangeinsurance +
    totalChageswithOutExchange;

  const sumofRoe =
    totalAdminnsitRoe +
    totalChaDestinationTransitRoe +
    transitRoe +
    totalChangeRoeOriginaftercalcuinsurance +
    totalChangeRoeOrigin;

  const estimateCalculate = async () => {
    try {
      const payload = {
        freight_id: getdata.freight_id,
        client_id: getdata.client_ref,
        client_name: getdata.client_name,
        serial_number: freight.serial_number,
        date: update.date,
        client_ref: getdata.client_ref,
        product_desc: getdata.product_desc,
        type: getdata.type,
        freight: getdata.freight,

        incoterm: getdata.incoterm,
        dimension: getdata.dimension,
        supplier_id: freight.supplier_id,
        weight: getdata.weight,
        org_pickUp_vatTyp: freight.org_pickUp_vatTyp,
        "org_pickUp_disc%": freight["org_pickUp_disc%"],
        origin_pick_up_cost: freight.origin_pick_up_cost,
        origin_pick_up_fees: freight.origin_pick_up_fees,
        origin_pickup_fee_gpcalc: freight.origin_pickup_fee_gpcalc,
        roe_origin_currencyorigin: freight.roe_origin_currencyorigin,
        finalvlaueoriginPickup: finalvlaueoriginPickup,
        oripick4: oripick4,
        finalori1: finalori1,
        origin_pick_up_fuel_cost: freight.origin_pick_up_fuel_cost,
        origin_pick_up_fuel_fees: freight.origin_pick_up_fuel_fees,
        origin_pick_fuelGP: freight.origin_pick_fuelGP,
        chargable_rate: freight.chargable_rate,
        orifuel4: orifuel4,
        finalfuel1: finalfuel1,
        roe_origin_fuel_currency: freight.roe_origin_fuel_currency,
        finalvlaueoFuel: finalvlaueoFuel,
        origin_pick_up_cfs_cost: freight.origin_pick_up_cfs_cost,
        origin_pick_up_cfs_fees: freight.origin_pick_up_cfs_fees,
        origin_pickup_vfs_gp: freight.origin_pickup_vfs_gp,
        oricfs4: oricfs4,
        finalcfs1: finalcfs1,
        roe_origin_cfs_currency: freight.roe_origin_cfs_currency,
        roe_freight_currency: freight.roe_freight_currency,
        finalvlaueocfs: finalvlaueocfs,
        origin_pick_up_documantion_cost:
          freight.origin_pick_up_documantion_cost,
        origin_pick_up_documantation_fees:
          freight.origin_pick_up_documantation_fees,
        origin_pick_documantation_cost_gp:
          freight.origin_pick_documantation_cost_gp,
        oridoc4: oridoc4,
        finaldoc1: finaldoc1,
        roe_origin_doc_currency: freight.roe_origin_doc_currency,
        finalvlaueodoc: finalvlaueodoc,
        origin_pick_up_forewarding_cost:
          freight.origin_pick_up_forewarding_cost,
        origin_pick_up_forewarding_fees:
          freight.origin_pick_up_forewarding_fees,
        origin_pickup_forewarding_gp: freight.origin_pickup_forewarding_gp,
        oriforewarding4: oriforewarding4,
        roe_origin_forewarding: freight.roe_origin_forewarding,
        finalforewarding1: finalforewarding1,
        finalvlaueoforewarding: finalvlaueoforewarding,
        origin_pick_up_custome_cost: freight.origin_pick_up_custome_cost,
        origin_pick_up_custome_clearance:
          freight.origin_pick_up_custome_clearance,
        origin_pickup_custome_gp: freight.origin_pickup_custome_gp,
        oricustome4: oricustome4,
        roe_origin_customes: freight.roe_origin_customes,
        finalcustomes1: finalcustomes1,
        finalvlaueoCustomes: finalvlaueoCustomes,
        totalChageswithOutExchange: totalChageswithOutExchange,
        totalChangeRoeOrigin: totalChangeRoeOrigin,
        freight_charge_currency_cost: freight.freight_charge_currency_cost,
        freight_charge_currency_fees: freight.freight_charge_currency_fees,
        freight_charge_currency_gp: freight.freight_charge_currency_gp,
        orifreight4: orifreight4,
        finalfreight1: finalfreight1,
        finalvlaueofreight: finalvlaueofreight,
        freight_currency_insurance_cost:
          freight.freight_currency_insurance_cost,
        freight_currency_insurance_unit:
          freight.freight_currency_insurance_unit,
        freightorigin_insurance_gp: freight.freightorigin_insurance_gp,
        oriinsurance4: oriinsurance4,
        roe_insurance_currency: freight.roe_insurance_currency,
        finalinsurance1: finalinsurance1,
        finalvlaueoInsurance: finalvlaueoInsurance,
        totalChageswithOutExchangeinsurance:
          totalChageswithOutExchangeinsurance,
        totalChangeRoeOriginaftercalcuinsurance:
          totalChangeRoeOriginaftercalcuinsurance,
        Transit_currency_Cost: freight.Transit_currency_Cost,
        Transit_currency_unit: freight.Transit_currency_unit,
        Transit_currency_gp: freight.Transit_currency_gp,
        Transit_currency_roe: freight.Transit_currency_roe,
        finaltransit1: finaltransit1,
        finalvlaueotransit: finalvlaueotransit,
        oritransit4: oritransit4,
        transit_currency_THC_cost: freight.transit_currency_THC_cost,
        transit_currency_THC_init: freight.transit_currency_THC_init,
        transit_currency_THC_gp: freight.transit_currency_THC_gp,
        roe_Transit_Thc: freight.roe_Transit_Thc,
        finalThc1: finalThc1,
        finalvlaueotfineal: finalvlaueotfineal,
        oriThc4: oriThc4,
        Transit_currency_unpack_cost: freight.Transit_currency_unpack_cost,
        Transit_currency_unpack_unit: freight.Transit_currency_unpack_unit,
        Transit_currency_unpack_gp: freight.Transit_currency_unpack_gp,
        Transit_unpack_roe: freight.Transit_unpack_roe,
        finalunpack1: finalunpack1,
        finalvlaueotfunpack: finalvlaueotfunpack,
        oriunpack4: oriunpack4,
        transit_3rd_party_cost: freight.transit_3rd_party_cost,
        transit_3rd_party_unit: freight.transit_3rd_party_unit,
        transit_3rd_party_gp: freight.transit_3rd_party_gp,
        ori3rdparty4: ori3rdparty4,
        final3rdparty1: final3rdparty1,
        finalvlaueot3dparty: finalvlaueot3dparty,
        transit_currency_3rd: freight.transit_currency_3rd,
        transit_admin_change: freight.transit_admin_change,
        transit_admin_unit: freight.transit_admin_unit,
        transit_admin_gp: freight.transit_admin_gp,
        ori3rdAdmin4: ori3rdAdmin4,
        final3rdAdmin1: final3rdAdmin1,
        finalvlaueotAdmin: finalvlaueotAdmin,
        roe_transit_admin: freight.roe_transit_admin,
        transit_currency_port: freight.transit_currency_port,
        transit_currency_port_unit: freight.transit_currency_port_unit,
        transit_currency_port_gp: freight.transit_currency_port_gp,
        ori3rdport4: ori3rdport4,
        final3rdport1: final3rdport1,
        finalvlaueotPort: finalvlaueotPort,
        roe_trans_port: freight.roe_trans_port,
        Transit_advanced_load: freight.Transit_advanced_load,
        Transit_advanced_unit: freight.Transit_advanced_unit,
        Transit_advanced_gp: freight.Transit_advanced_gp,
        Transit_advanced_gp_roe: freight.Transit_advanced_gp_roe,
        oriadv4: oriadv4,
        final3rdadv1: final3rdadv1,
        finalvlaueotadv: finalvlaueotadv,
        transit_change_Documentation: freight.transit_change_Documentation,
        transit_change_Documentation_unit:
          freight.transit_change_Documentation_unit,
        transit_change_Documentation_gp:
          freight.transit_change_Documentation_gp,
        roe_transit_change_Documentation:
          freight.roe_transit_change_Documentation,
        oridocumentation4: oridocumentation4,
        final3rdocumantation1: final3rdocumantation1,
        finalvlaueotDocumantation: finalvlaueotDocumantation,
        totalChageswithOuTransit: totalChageswithOuTransit,
        transitRoe: transitRoe,
        Destination_freight_currency_cost:
          freight.Destination_freight_currency_cost,
        Destination_freight_currency_unit:
          freight.Destination_freight_currency_unit,
        Destination_freight_currency_gp:
          freight.Destination_freight_currency_gp,
        destinationdocumentation4: destinationdocumentation4,
        final3rdestination1: final3rdestination1,
        final3rdestinationRoe: final3rdestinationRoe,
        Destination_freight_currency_Roe:
          freight.Destination_freight_currency_Roe,

        Destination_THC_currency_cost: freight.Destination_THC_currency_cost,
        Destination_THC_currency_unit: freight.Destination_THC_currency_unit,
        Destination_THC_currency_gp: freight.Destination_THC_currency_gp,
        destinationTHCdocumentation4: destinationTHCdocumentation4,
        final3rTHCdestination1: final3rTHCdestination1,
        final3rTHCdestinationRoe: final3rTHCdestinationRoe,
        Destination_THC_currency_Roe: freight.Destination_THC_currency_Roe,
        Destination_Unpack_currency_cost:
          freight.Destination_Unpack_currency_cost,
        Destination_Unpack_currency_unit:
          freight.Destination_Unpack_currency_unit,
        Destination_Unpack_currency_gp: freight.Destination_Unpack_currency_gp,
        destinationUnpackdocumentation4: destinationUnpackdocumentation4,
        final3runpackdestination1: final3runpackdestination1,
        final3rUnpackdestinationRoe: final3rUnpackdestinationRoe,
        Destination_Unpack_currency_roe:
          freight.Destination_Unpack_currency_roe,
        Destination_fuelsurcharge_currency_cost:
          freight.Destination_fuelsurcharge_currency_cost,
        Destination_fuelsurcharge_currency_unit:
          freight.Destination_fuelsurcharge_currency_unit,
        Destination_fuelsurcharge_currency_gp:
          freight.Destination_fuelsurcharge_currency_gp,
        destinationfuelsurchargedocumentation4:
          destinationfuelsurchargedocumentation4,
        final3rfuelsurchargedestination1: final3rfuelsurchargedestination1,
        final3rfuelsurCahrgeestinationRoe: final3rfuelsurCahrgeestinationRoe,
        Destination_fuelsurcharge_currency_roe:
          freight.Destination_fuelsurcharge_currency_roe,
        Destination_adminsurcharge_currency_cost:
          freight.Destination_adminsurcharge_currency_cost,
        Destination_adminsurcharge_currency_unit:
          freight.Destination_adminsurcharge_currency_unit,
        Destination_adminsurcharge_currency_gp:
          freight.Destination_adminsurcharge_currency_gp,
        destinatiadminsurcharge4: destinatiadminsurcharge4,
        Valueadminsurchargedestanion: Valueadminsurchargedestanion,
        adminsurcharge2: adminsurcharge2,
        Destination_adminsurcharge_currency_roe:
          freight.Destination_adminsurcharge_currency_roe,
        Destination_portcargo_currency_cost:
          freight.Destination_portcargo_currency_cost,
        Destination_portcargo_currency_unit:
          freight.Destination_portcargo_currency_unit,
        Destination_portcargo_currency_gp:
          freight.Destination_portcargo_currency_gp,
        destinatiportcargo4: destinatiportcargo4,
        Vaportcargoion: Vaportcargoion,
        admiportcargo2: admiportcargo2,
        Destination_portcargo_currency_roe:
          freight.Destination_portcargo_currency_roe,
        Destination_AdvancedLoad_currency_cost:
          freight.Destination_AdvancedLoad_currency_cost,
        Destination_AdvancedLoad_currency_unit:
          freight.Destination_AdvancedLoad_currency_unit,
        Destination_AdvancedLoad_currency_gp:
          freight.Destination_AdvancedLoad_currency_gp,
        destinatiAdvancedLoad4: destinatiAdvancedLoad4,
        VAdvancedLoadion: VAdvancedLoadion,
        desdvancedLoadion: desdvancedLoadion,
        Destination_AdvancedLoad_currency_roe:
          freight.Destination_AdvancedLoad_currency_roe,
        Destination_3rdpartyDesc_currency_cost:
          freight.Destination_3rdpartyDesc_currency_cost,
        Destination_3rdpartyDesc_currency_unit:
          freight.Destination_3rdpartyDesc_currency_unit,
        Destination_3rdpartyDesc_currency_gp:
          freight.Destination_3rdpartyDesc_currency_gp,
        destinati3rdpartyload4: destinati3rdpartyload4,
        VAdvanced3rdpartyLoadion: VAdvanced3rdpartyLoadion,
        desdva3rdpartyion: desdva3rdpartyion,
        Destination_3rdpartyDesc_currency_roe:
          freight.Destination_3rdpartyDesc_currency_roe,
        Destination_delivery_currency_cost:
          freight.Destination_delivery_currency_cost,
        Destination_delivery_currency_unit:
          freight.Destination_delivery_currency_unit,
        Destination_delivery_currency_gp:
          freight.Destination_delivery_currency_gp,
        destindeliveryyDesc4: destindeliveryyDesc4,
        VAdvandeliverytyLoadion: VAdvandeliverytyLoadion,
        desddeliverytyion: desddeliverytyion,
        Destination_delivery_currency_roe:
          freight.Destination_delivery_currency_roe,
        Destination_fuelcharge_currency_cost:
          freight.Destination_fuelcharge_currency_cost,
        Destination_fuelcharge_currency_unit:
          freight.Destination_fuelcharge_currency_unit,
        Destination_fuelcharge_currency_gp:
          freight.Destination_fuelcharge_currency_gp,
        destindfuelchangerDesc4: destindfuelchangerDesc4,
        VAdvfuelchangeon: VAdvfuelchangeon,
        defuelchangyion: defuelchangyion,
        Destination_fuelcharge_currency_roe:
          freight.Destination_fuelcharge_currency_roe,
        totalChaDestinationTransit: totalChaDestinationTransit,
        totalChaDestinationTransitRoe: totalChaDestinationTransitRoe,
        Destination_AdminAgrncy_currency_cost:
          freight.Destination_AdminAgrncy_currency_cost,
        Destination_AdminAgrncy_currency_unit:
          freight.Destination_AdminAgrncy_currency_unit,
        Destination_AdminAgrncy_currency_gp:
          freight.Destination_AdminAgrncy_currency_gp,
        deadminAgencyesc4: deadminAgencyesc4,
        // finaldminAgencyestanion: finaldminAgencyestanion,
        VAadminAgencyngeon: VAadminAgencyngeon,
        defuelchdminAgencyngangyion: defuelchdminAgencyngangyion,
        Destination_AdminAgrncy_currency_roe:
          freight.Destination_AdminAgrncy_currency_roe,
        Destination_disbursemant_currency_cost:
          freight.Destination_disbursemant_currency_cost,
        Destination_disbursemant_currency_unit:
          freight.Destination_disbursemant_currency_unit,
        Destination_disbursemant_currency_gp:
          freight.Destination_disbursemant_currency_gp,
        deaddisbursemantc4: deaddisbursemantc4,
        VAdisbursemon: VAdisbursemon,
        dedisbursementon: dedisbursementon,
        Destination_disbursemant_currency_roe:
          freight.Destination_disbursemant_currency_roe,
        Destination_doc_currency_cost: freight.Destination_doc_currency_cost,
        Destination_doc_currency_unit: freight.Destination_doc_currency_unit,
        Destination_doc_currency_gp: freight.Destination_doc_currency_gp,
        deadoctc4: deadoctc4,
        VAdocon: VAdocon,
        dedisbudoon: dedisbudoon,
        Destination_doc_currency_roe: freight.Destination_doc_currency_roe,
        deadoctc4: deadoctc4,
        totaAdminransit: totaAdminransit,
        totalAdminnsitRoe: totalAdminnsitRoe,
        sumofall: sumofall,
        sumofRoe: sumofRoe,
        freight_charge_currencyQTY: freight.freight_charge_currencyQTY,
        origin_pick_up_fuel_unitTypeQTY:
          freight.origin_pick_up_fuel_unitTypeQTY,
        origin_pick_up_cfs_unitTypeQTY: freight.origin_pick_up_cfs_unitTypeQTY,
        origin_pick_up_forewarding_unitTypeQTY:
          freight.origin_pick_up_forewarding_unitTypeQTY,
        origin_pick_up_documantation_unitTypeQTY:
          freight.origin_pick_up_documantation_unitTypeQTY,
        origin_pick_up_custome_unitTypeQTY:
          freight.origin_pick_up_custome_unitTypeQTY,
        freight_charge_currency_unitTypeQTY:
          freight.freight_charge_currency_unitTypeQTY,
        freight_currency_insurance_unittypeQTY:
          freight.freight_currency_insurance_unittypeQTY,
        Transit_currency_unitTpeQTY: freight.Transit_currency_unitTpeQTY,
        transit_currency_THC_initTypeQTY:
          freight.transit_currency_THC_initTypeQTY,
        transit_currency_THC_initTypeeQTY:
          freight.transit_currency_THC_initTypeeQTY,
        transit_3rd_party_unittypeQTY: freight.transit_3rd_party_unittypeQTY,
        transit_admin_unittypeQTY: freight.transit_admin_unittypeQTY,
        transit_currency_port_unitTypeQTY:
          freight.transit_currency_port_unitTypeQTY,
        Transit_advanced_unitTypeQTY: freight.Transit_advanced_unitTypeQTY,
        transit_change_Documentation_unitTypeQTY:
          freight.transit_change_Documentation_unitTypeQTY,
        Destination_freight_currency_unitTypeQTY:
          freight.Destination_freight_currency_unitTypeQTY,
        Destination_THC_currency_unitTypeQTY:
          freight.Destination_THC_currency_unitTypeQTY,
        Destination_Unpack_currency_unitTypeQTY:
          freight.Destination_Unpack_currency_unitTypeQTY,
        Destination_fuelsurcharge_currency_typeUnitQTY:
          freight.Destination_fuelsurcharge_currency_typeUnitQTY,
        Destination_adminsurcharge_currency_unitTypeQTY:
          freight.Destination_adminsurcharge_currency_unitTypeQTY,
        Destination_portcargo_currency_unitTypeQTY:
          freight.Destination_portcargo_currency_unitTypeQTY,
        Destination_AdvancedLoad_currency_unitTypeQTY:
          freight.Destination_AdvancedLoad_currency_unitTypeQTY,
        Destination_3rdpartyDesc_currency_unitTypeQTY:
          freight.Destination_3rdpartyDesc_currency_unitTypeQTY,
        Destination_delivery_currency_unitTypeQTY:
          freight.Destination_delivery_currency_unitTypeQTY,
        Destination_fuelcharge_currency_unitTypeQTY:
          freight.Destination_fuelcharge_currency_unitTypeQTY,
        Destination_AdminAgrncy_currency_unitQTY:
          freight.Destination_AdminAgrncy_currency_unitQTY,
        Destination_disbursemant_currency_unitTypeQTY:
          freight.Destination_disbursemant_currency_unitTypeQTY,
        origin_pick_up_unitType: freight.origin_pick_up_unitType,
        origin_pick_up_fuel_unitType: freight.origin_pick_up_fuel_unitType,
        origin_pick_up_cfs_unitType: freight.origin_pick_up_cfs_unitType,
        origin_pick_up_forewarding_unitType:
          freight.origin_pick_up_forewarding_unitType,
        origin_pick_up_documantation_unitType:
          freight.origin_pick_up_documantation_unitType,
        origin_pick_up_custome_unitType:
          freight.origin_pick_up_custome_unitType,
        freight_charge_currency_unitType:
          freight.freight_charge_currency_unitType,
        freight_currency_insurance_unittype:
          freight.freight_currency_insurance_unittype,
        Transit_currency_unitTpe: freight.Transit_currency_unitTpe,
        transit_currency_THC_initType: freight.transit_currency_THC_initType,
        Transit_currency_unpack_unitType:
          freight.Transit_currency_unpack_unitType,
        transit_3rd_party_unittype: freight.transit_3rd_party_unittype,
        transit_admin_unittype: freight.transit_admin_unittype,
        transit_currency_port_unitType: freight.transit_currency_port_unitType,
        Transit_advanced_unitType: freight.Transit_advanced_unitType,
        transit_change_Documentation_unitType:
          freight.transit_change_Documentation_unitType,
        Destination_freight_currency_unitType:
          freight.Destination_freight_currency_unitType,
        Destination_THC_currency_unitType:
          freight.Destination_THC_currency_unitType,
        Destination_Unpack_currency_unitType:
          freight.Destination_Unpack_currency_unitType,
        Destination_fuelsurcharge_currency_typeUnit:
          freight.Destination_fuelsurcharge_currency_typeUnit,
        Destination_adminsurcharge_currency_unitType:
          freight.Destination_adminsurcharge_currency_unitType,
        Destination_portcargo_currency_unitType:
          freight.Destination_portcargo_currency_unitType,
        Destination_AdvancedLoad_currency_unitType:
          freight.Destination_AdvancedLoad_currency_unitType,
        Destination_3rdpartyDesc_currency_unitType:
          freight.Destination_3rdpartyDesc_currency_unitType,
        Destination_delivery_currency_unitType:
          freight.Destination_delivery_currency_unitType,
        Destination_fuelcharge_currency_unitType:
          freight.Destination_fuelcharge_currency_unitType,
        Destination_AdminAgrncy_currency_unitType:
          freight.Destination_AdminAgrncy_currency_unitType,
        Destination_doc_currency_unittype:
          freight.Destination_doc_currency_unittype,
        Destination_AdminAgrncy_currency_unitType:
          freight.Destination_AdminAgrncy_currency_unitType,
        Destination_doc_currency_unittypeQTY:
          freight.Destination_doc_currency_unittypeQTY,
        ...(getdata.quote_estimate_id && {
          quote_estimate_id: getdata.quote_estimate_id,
        }),
      };
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}addEstimateShippingQuote`,
        payload
      );
      if (response.data.success === true) {
        toast.success(response.data.message);
      } else {
        console.log("some thing went wrong");
      }
    } catch (error) {
      console.log(error.data);
    }
  };
  const supplier = () => {
    const fId = getFreightId();
    if (!fId) {
      console.log("No freight ID found, skipping supplier fetch");
      return;
    }
    axios
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
  useEffect(() => {
    supplier();
    supplierSelected();
  }, []);
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
  useEffect(() => {
    getsupplier();
  }, []);
  useEffect(() => {
    getdataapi();
    getNewDataapi();
    getFreightQuoteEstimate();
  }, []);

  const getsupplier = () => {
    axios
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

  const getNewDataapi = async () => {
    const quoteEstimateId = getQuoteEstimateId();
    if (!quoteEstimateId) {
      console.log("No quote_estimate_id or freight_quote_estimate_id found to fetch estimate in getNewDataapi");
      return;
    }
    const data123456 = {
      quote_estimate_id: quoteEstimateId,
      freight_id: getFreightId(),
    };
    await axios
      .post(
        `${process.env.REACT_APP_BASE_URL}GetQuoteShipEstimateById`,
        data123456
      )
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
  const handleclicknav = () => {
    window.history.back();
  };
  const getdata1 = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}supplier-list`)
      .then((response) => {
        setDat(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    getdata1();
  }, []);
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
  const downloadPDF1 = async () => {
    const element = pdfRef.current;
    if (!element) return;

    // Clone the element to adjust its styling for PDF generation without affecting screen display
    const clone = element.cloneNode(true);

    // Sync input and select values from original element to the clone
    const originalInputs = element.querySelectorAll("input, select, textarea");
    const cloneInputs = clone.querySelectorAll("input, select, textarea");
    originalInputs.forEach((input, index) => {
      if (cloneInputs[index]) {
        if (input.tagName === "SELECT") {
          cloneInputs[index].value = input.value;
        } else if (input.type === "checkbox" || input.type === "radio") {
          cloneInputs[index].checked = input.checked;
        } else {
          cloneInputs[index].value = input.value;
        }
      }
    });

    // Replace inputs and selects with plain text in the clone for a clean PDF look
    clone.querySelectorAll("input, select, textarea").forEach((el) => {
      let displayValue = "";
      if (el.tagName === "SELECT") {
        const selectedOption = el.selectedIndex >= 0 ? el.options[el.selectedIndex] : null;
        displayValue = (selectedOption?.textContent ?? "").trim();
        if (displayValue === "Select") displayValue = "";
      } else {
        displayValue = (el.value ?? "").trim();
      }

      const span = document.createElement("span");
      span.textContent = displayValue;
      span.style.fontSize = "13px";
      span.style.fontWeight = "bold";
      span.style.color = "#000";

      el.style.display = "none";
      if (el.parentNode) {
        el.parentNode.insertBefore(span, el.nextSibling);
      }
    });

    // Create temporary container offscreen
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = "1600px";
    container.style.height = "auto";
    container.style.overflow = "visible";
    container.style.background = "#ffffff";
    container.appendChild(clone);
    document.body.appendChild(container);

    // Override styling on the clone to guarantee it is displayed wide
    clone.style.width = "1600px";
    clone.style.minWidth = "1600px";
    clone.style.maxWidth = "1600px";

    const pdfPage = clone.querySelector(".pdf-page") || clone;
    pdfPage.style.width = "1600px";
    pdfPage.style.minWidth = "1600px";
    pdfPage.style.maxWidth = "1600px";
    pdfPage.style.padding = "20px";
    pdfPage.style.boxSizing = "border-box";
    pdfPage.style.outline = "none";

    const tableResponsive = clone.querySelector(".table-responsive");
    if (tableResponsive) {
      tableResponsive.style.overflow = "visible";
      tableResponsive.style.width = "100%";
      tableResponsive.style.maxWidth = "100%";
    }

    const contentHeight = container.scrollHeight || clone.offsetHeight || 1200;

    const options = {
      margin: 0,
      filename: "supplier-estimate.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { 
        scale: 1.5, 
        useCORS: true, 
        windowWidth: 1600,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        width: 1600,
        height: contentHeight
      },
      jsPDF: {
        unit: "px",
        format: [1600, contentHeight],
        orientation: "portrait",
      },
      pagebreak: { mode: ["css", "legacy"] },
    };

    try {
      await html2pdf().from(clone).set(options).save();
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      document.body.removeChild(container);
    }
  };

  return (
    <>
      <div className="wpWrapper ">
        <div className="container-fluid">
          <div className=" ">
            <div className=" ">
              <div className="row">
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
                  <p>
                    <table style={{ margin: "20px" }}>
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
                                fontSize: 14,
                                fontWeight: 500,
                                marginBottom: "unset",
                                lineHeight: "1.5",
                                marginTop: 5,
                              }}
                            >
                              Asia Direct, Unit 4 Villa Valencia 2 Anemoon Road
                              Glen Marais 1619 South Africa Web
                              www.asiaDirect.africa{" "}
                            </p>
                            <p>
                              <span>VAT Number: 4740280377</span>
                              <br />
                              TEL: +27 10 448 0733
                            </p>
                            <p> </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table style={{ paddingTop: "20px", marginTop: "20px" }}>
                      <tbody>
                        <tr>
                          <td
                            style={{ fontSize: 14, textTransform: "lowercase" }}
                          ></td>
                          <td
                            style={{
                              fontSize: 14,
                              padding: "0px 20px",
                              textTransform: "lowercase",
                            }}
                          ></td>
                          <td
                            style={{ fontSize: 14, textTransform: "lowercase" }}
                          ></td>
                        </tr>
                      </tbody>
                    </table>
                    <table
                      style={{
                        border: "2px solid #1b2245",
                        padding: "10px 20px",
                        width: "100%",
                        marginTop: 20,
                      }}
                    >
                      <tbody>
                        <tr>
                          <td
                            style={{
                              textAlign: "center",
                              fontSize: 14,
                              fontWeight: 600,
                              width: "100%",
                            }}
                          >
                            FREIGHT ESTIMATE
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table
                      style={{
                        border: "2px solid #1b2245",
                        borderTop: "unset",
                        width: "100%",
                      }}
                    >
                      <tbody>
                        <tr>
                          <td
                            style={{
                              width: "50%",
                              borderRight: "2px solid #1a2142",
                              height: "100%",
                            }}
                          >
                            <table>
                              <tbody>
                                <tr>
                                  <td
                                    style={{
                                      fontSize: 14,
                                      padding: "0px 10px",
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
                                fontSize: 14,
                                textAlign: "center",
                                margin: "10px 0px",
                                padding: 2,
                              }}
                            >
                              <tbody>
                                <tr>
                                  <td style={{ fontSize: 14 }}>
                                    Shipment Details ISO Commodity
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <table style={{ width: "100%" }}>
                              <tbody>
                                <tr>
                                  { }
                                  <td style={{ padding: "0px 10px" }}>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>No. of Packages</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
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
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>Package Type</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
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
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>Weight</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
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
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>M3</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      ></p>
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>Volumetric (kgs)</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
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
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>Chargeable</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
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
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>Commodity</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {getdata?.commodity}
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
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>Hazardous</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {getdata?.hazardous}
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
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>Incoterm</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
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
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong> Freight</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {getdata?.freight}
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
                                fontSize: 14,
                                textAlign: "center",
                                margin: "10px 0px",
                                padding: 2,
                              }}
                            >
                              <tbody>
                                <tr>
                                  <td style={{ fontSize: 14 }}>
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
                                        padding: 10,
                                      }}
                                    >
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                        }}
                                      >
                                        <strong>Final Base Currency</strong>
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
                              </tbody>
                            </table>
                          </td>
                          <td style={{ width: "50%", paddingTop: 10 }}>
                            <table>
                              <tbody>
                                <tr>
                                  <td style={{
                                    width: 170,
                                    display: "block",
                                    padding: "0px 10px",
                                    fontSize: 13,

                                  }}><strong>
                                      Invoice For
                                    </strong></td>
                                    <td
                                    style={{ paddingBottom: 10, fontSize: 14 }}
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
                                    padding: "0px 10px",
                                    fontSize: 13,
                                  }}><strong>
                                      Invoice No.
                                    </strong></td>
                                    <td
                                    style={{ fontSize: 14 }}
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
                                      padding: "0px 10px",
                                      fontSize: 14,
                                    }}
                                  >
                                    <strong>Reference</strong>
                                  </td>
                                  <td
                                    style={{  fontSize: 14 }}
                                  >
                                    {freight?.reference_no}
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    style={{
                                      padding: "0px 10px 10px 10px",
                                      width: 170,
                                      display: "block",
                                      fontSize: 14,
                                    }}
                                  >
                                    <strong>Quote Date</strong>
                                  </td>
                                  <td
                                    style={{
                                      fontSize: 14,
                                    }}
                                  >
                                    {new Date(getdata?.date).toLocaleDateString(
                                      "en-GB"
                                    )}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <table
                              style={{
                                background: "#1b2245",
                                width: "100%",
                                color: "white",
                                fontSize: 14,
                                textAlign: "center",
                                margin: "10px 0px",
                                padding: 2,
                              }}
                            >
                              <tbody>
                                <tr>
                                  <td style={{ fontSize: 14 }}>
                                    Shipment Details
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <table style={{ width: "100%" }}>
                              <tbody>
                                <tr>
                                  <td style={{ padding: "0px 10px" }}>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong> Country of Origin</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
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
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong> Place of Receipt</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
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
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>Port of Loading</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
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
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>Port of Discharge</strong>
                                      </p>
                                      <p
                                        className="text-dark"
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
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
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong> Place of Delivery</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
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
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>
                                          {" "}
                                          Freight Collect Accepted
                                        </strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {getdata?.quote_received}
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
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong> Date</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {new Date(
                                          getdata?.date
                                        ).toLocaleDateString("en-GB")}
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </p>
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
                          <th>Price</th>
                          <th>Curr</th>
                          <th>Exch rate</th>
                          <th>Total</th>
                          <th>VAT Type</th>
                          <th>Disc %</th>
                          <th>Discount</th>
                          <th>Exclusive</th>
                          <th>Total</th>
                        </tr>
                      </thead>

                      <tbody>
                        {/* origin charges */}

                        {!isNaN(finalvlaueoriginPickup) &&
                          finalvlaueoriginPickup !== 0 && (
                            <tr>
                              <td>Pick-Up Fee</td>
                              <td>
                                <input
                                  style={{
                                    marginBottom: 0,
                                    fontSize: 13,
                                    color: "black",
                                    fontWeight: 400,
                                    border: "0px",

                                    verticalAlign: "middle",
                                  }}
                                  type="text"
                                  className="supplier_form"
                                  onChange={handlechangecalc}
                                  value={freight?.freight_charge_currencyQTY}
                                  name="freight_charge_currencyQTY"
                                  id="floatingInput"
                                  placeholder="0.00"
                                />
                              </td>
                              <td>
                                <select
                                  className="select_supplier"
                                  style={{
                                    margin: 0,
                                    fontSize: 13,
                                    fontWeight: 700,
                                    paddingLeft: 5,
                                    border: 0,
                                  }}
                                  onChange={handlechangecalc}
                                  name="origin_pick_up_unitType"
                                  value={freight?.origin_pick_up_unitType}
                                >
                                  <option>Select</option>
                                  <option value="1">L/S</option>
                                  <option value="2">W/M</option>
                                </select>
                              </td>
                              <td>
                                <input
                                  style={{
                                    marginBottom: 0,
                                    fontSize: 13,
                                    color: "black",
                                    fontWeight: 400,
                                    border: "0px",

                                    verticalAlign: "middle",
                                  }}
                                  type="text"
                                  onKeyPress={handlepresss}
                                  className="supplier_form"
                                  disabled
                                  onChange={handlechangecalc}
                                  value={
                                    freight.origin_pick_up_unitType
                                      ? oripick2
                                        ? oripick2
                                        : 0
                                      : 0
                                  }
                                  name="origin_pick_up_fees"
                                  id="floatingInput"
                                  placeholder="0.00"
                                />
                              </td>
                              <td>
                                <input
                                  style={{
                                    marginBottom: 0,
                                    fontSize: 13,
                                    color: "black",
                                    fontWeight: 400,
                                    border: "0px",

                                    verticalAlign: "middle",
                                  }}
                                  type="text"
                                  onKeyPress={handlepresss}
                                  className="supplier_form"
                                  onChange={handlechangecalc}
                                  value={freight?.origin_pick_up_cost}
                                  name="origin_pick_up_cost"
                                  id="floatingInput"
                                  placeholder="0.00"
                                />
                              </td>
                              <td>
                                <select
                                  className="select_supplier"
                                  style={{
                                    margin: 0,
                                    fontSize: 13,
                                    fontWeight: 700,
                                    paddingLeft: 5,
                                    border: 0,
                                  }}
                                  onChange={handlechangecalc}
                                  name="pickup_freight_currency"
                                  value={freight?.pickup_freight_currency}
                                >
                                  <option>Select</option>
                                  <option value="RAND">RAND</option>
                                  <option value="USD">USD</option>
                                  <option value="INR">INR</option>
                                  <option value="EURO">EURO</option>
                                </select>
                              </td>
                              <td>
                                <input
                                  style={{
                                    marginBottom: 0,
                                    fontSize: 13,
                                    color: "black",

                                    border: "0px",
                                    verticalAlign: "middle",
                                  }}
                                  name="roe_origin_currencyorigin"
                                  onChange={handlechangecalc}
                                  value={freight.roe_origin_currencyorigin}
                                  className="supplier_form"
                                />
                              </td>
                              <td>
                                <input
                                  style={{
                                    marginBottom: 0,
                                    fontSize: 13,
                                    color: "black",

                                    border: "0px",
                                    verticalAlign: "middle",
                                  }}
                                  disabled
                                  value={isNaN(finalvlaueoriginPickup) ? 0 : finalvlaueoriginPickup.toFixed(2)}
                                  className="supplier_form"
                                />
                              </td>
                              <td>
                                <select
                                  className="select_supplier"
                                  style={{
                                    margin: 0,
                                    fontSize: 13,
                                    fontWeight: 700,
                                    paddingLeft: 5,
                                    border: 0,
                                  }}
                                  onChange={handlechangecalc}
                                  name="org_pickUp_vatTyp"
                                  value={freight?.org_pickUp_vatTyp || ""}
                                >
                                  {VAT_OPTIONS.map((opt, i) => (
                                    <option key={i} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <input
                                  style={{
                                    marginBottom: 0,
                                    fontSize: 13,
                                    color: "black",
                                    width: "50px",
                                    border: "0px",

                                    verticalAlign: "middle",
                                  }}
                                  type="text"
                                  onChange={handlechangecalc}
                                  value={freight?.["org_pickUp_disc%"] || ""}
                                  name="org_pickUp_disc%"
                                  placeholder="0.00%"
                                />
                              </td>
                              <td>
                                <input
                                  style={{
                                    marginBottom: 0,
                                    fontSize: 13,
                                    color: "black",
                                    border: "0px",
                                    verticalAlign: "middle",
                                  }}
                                  disabled
                                  value={formatValue(pickUpCalc.discount)}
                                  className="supplier_form"
                                />
                              </td>
                              <td>
                                <input
                                  style={{
                                    marginBottom: 0,
                                    fontSize: 13,
                                    color: "black",
                                    border: "0px",
                                    verticalAlign: "middle",
                                  }}
                                  disabled
                                  value={formatValue(pickUpCalc.exclusive)}
                                  className="supplier_form"
                                />
                              </td>
                              <td>
                                <input
                                  style={{
                                    marginBottom: 0,
                                    fontSize: 13,
                                    color: "black",
                                    border: "0px",
                                    verticalAlign: "middle",
                                  }}
                                  disabled
                                  value={formatValue(pickUpCalc.vat)}
                                  className="supplier_form"
                                />
                              </td>
                            </tr>
                          )}

                        {!isNaN(finalvlaueoFuel) && finalvlaueoFuel !== 0 && (
                          <tr>
                            <td>Fuel Surcharge</td>
                            <td>
                              <input
                                style={{
                                  marginBottom: 0,
                                  fontSize: 13,
                                  color: "black",
                                  fontWeight: 400,
                                  border: "0px",

                                  verticalAlign: "middle",
                                }}
                                type="text"
                                className="supplier_form"
                                onChange={handlechangecalc}
                                value={freight?.origin_pick_up_fuel_unitTypeQTY}
                                name="origin_pick_up_fuel_unitTypeQTY"
                                id="floatingInput"
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <select
                                className="select_supplier"
                                style={{
                                  margin: 0,
                                  fontSize: 13,
                                  fontWeight: 700,
                                  paddingLeft: 5,
                                  border: 0,
                                }}
                                onChange={handlechangecalc}
                                name="origin_pick_up_fuel_unitType"
                                value={freight?.origin_pick_up_fuel_unitType}
                              >
                                <option>Select</option>
                                <option value="1">L/S</option>
                                <option value="2">W/M</option>
                              </select>
                            </td>
                            <td>
                              <input
                                style={{
                                  marginBottom: 0,
                                  fontSize: 13,
                                  color: "black",
                                  fontWeight: 400,
                                  border: "0px",

                                  verticalAlign: "middle",
                                }}
                                type="text"
                                onKeyPress={handlepresss}
                                className="supplier_form"
                                disabled
                                onChange={handlechangecalc}
                                value={
                                  freight.origin_pick_up_fuel_unitType
                                    ? orifuel2
                                      ? orifuel2
                                      : 0
                                    : 0.0
                                }
                                name="origin_pick_up_fuel_fees"
                                id="floatingInput"
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <input
                                style={{
                                  marginBottom: 0,
                                  fontSize: 13,
                                  color: "black",
                                  fontWeight: 400,
                                  border: "0px",

                                  verticalAlign: "middle",
                                }}
                                type="text"
                                onKeyPress={handlepresss}
                                className="supplier_form"
                                onChange={handlechangecalc}
                                value={freight?.origin_pick_up_fuel_cost}
                                name="origin_pick_up_fuel_cost"
                                id="floatingInput"
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <select
                                className="select_supplier"
                                style={{
                                  margin: 0,
                                  fontSize: 13,
                                  fontWeight: 700,
                                  paddingLeft: 5,
                                  border: 0,
                                }}
                                onChange={handlechangecalc}
                                name="pickup_freight_currency"
                                value={freight?.pickup_freight_currency}
                              >
                                <option>Select</option>
                                <option value="RAND">RAND</option>
                                <option value="USD">USD</option>
                                <option value="INR">INR</option>
                                <option value="EURO">EURO</option>
                              </select>
                            </td>
                            <td>
                              <input
                                style={{
                                  marginBottom: 0,
                                  fontSize: 13,
                                  color: "black",

                                  border: "0px",
                                  verticalAlign: "middle",
                                }}
                                name="roe_origin_fuel_currency"
                                value={freight.roe_origin_fuel_currency}
                                onChange={handlechangecalc}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <input
                                style={{
                                  marginBottom: 0,
                                  fontSize: 13,
                                  color: "black",
                                  border: "0px",
                                  verticalAlign: "middle",
                                }}
                                disabled
                                value={isNaN(finalvlaueoFuel) ? 0 : finalvlaueoFuel.toFixed(2)}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <select disabled className="select_supplier" style={{ margin: 0, fontSize: 13, fontWeight: 700, paddingLeft: 5, border: 0 }}>
                                <option value="">No Vat</option>
                              </select>
                            </td>
                            <td>
                              <input disabled style={{ marginBottom: 0, fontSize: 13, color: "black", width: "50px", border: "0px", verticalAlign: "middle" }} placeholder="0.00%" />
                            </td>
                            <td>
                              <input disabled style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }} value={formatValue(fuelCalc.discount)} className="supplier_form" />
                            </td>
                            <td>
                              <input disabled style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }} value={formatValue(fuelCalc.exclusive)} className="supplier_form" />
                            </td>
                            <td>
                              <input disabled style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }} value={formatValue(fuelCalc.vat)} className="supplier_form" />
                            </td>
                          </tr>
                        )}

                        {!isNaN(finalvlaueocfs) && finalvlaueocfs !== 0 && (
                          <tr>
                            <td>CFS Charge</td>
                            <td>
                              <input
                                style={{
                                  marginBottom: 0,
                                  fontSize: 13,
                                  color: "black",
                                  fontWeight: 400,
                                  border: "0px",

                                  verticalAlign: "middle",
                                }}
                                type="text"
                                className="supplier_form"
                                onChange={handlechangecalc}
                                value={freight?.origin_pick_up_cfs_unitTypeQTY}
                                name="origin_pick_up_cfs_unitTypeQTY"
                                id="floatingInput"
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <select
                                className="select_supplier"
                                style={{
                                  margin: 0,
                                  fontSize: 13,
                                  fontWeight: 700,
                                  paddingLeft: 5,
                                  border: 0,
                                }}
                                onChange={handlechangecalc}
                                name="origin_pick_up_cfs_unitType"
                                value={freight?.origin_pick_up_cfs_unitType}
                              >
                                <option>Select</option>
                                <option value="1">L/S</option>
                                <option value="2">W/m</option>
                              </select>
                            </td>
                            <td>
                              <input
                                style={{
                                  marginBottom: 0,
                                  fontSize: 13,
                                  color: "black",
                                  fontWeight: 400,
                                  border: "0px",

                                  verticalAlign: "middle",
                                }}
                                type="text"
                                onKeyPress={handlepresss}
                                className="supplier_form"
                                disabled
                                onChange={handlechangecalc}
                                value={
                                  freight.origin_pick_up_cfs_unitType
                                    ? oricfs2
                                      ? oricfs2
                                      : 0
                                    : 0.0
                                }
                                name="origin_pick_up_cfs_fees"
                                id="floatingInput"
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <input
                                style={{
                                  marginBottom: 0,
                                  fontSize: 13,
                                  color: "black",
                                  fontWeight: 400,
                                  border: "0px",

                                  verticalAlign: "middle",
                                }}
                                type="text"
                                onKeyPress={handlepresss}
                                className="supplier_form"
                                onChange={handlechangecalc}
                                value={freight?.origin_pick_up_cfs_cost}
                                name="origin_pick_up_cfs_cost"
                                id="floatingInput"
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <select
                                className="select_supplier"
                                style={{
                                  margin: 0,
                                  fontSize: 13,
                                  fontWeight: 700,
                                  paddingLeft: 5,
                                  border: 0,
                                }}
                                onChange={handlechangecalc}
                                name="pickup_freight_currency"
                                value={freight?.pickup_freight_currency}
                              >
                                <option>Select</option>
                                <option value="RAND">RAND</option>
                                <option value="USD">USD</option>
                                <option value="INR">INR</option>
                                <option value="EURO">EURO</option>
                              </select>
                            </td>
                            <td>
                              <input
                                style={{
                                  marginBottom: 0,
                                  fontSize: 13,
                                  color: "black",

                                  border: "0px",
                                  verticalAlign: "middle",
                                }}
                                name="roe_origin_cfs_currency"
                                value={freight.roe_origin_cfs_currency}
                                onChange={handlechangecalc}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <input
                                style={{
                                  marginBottom: 0,
                                  fontSize: 13,
                                  color: "black",
                                  border: "0px",
                                  verticalAlign: "middle",
                                }}
                                disabled
                                value={isNaN(finalvlaueocfs) ? 0 : finalvlaueocfs.toFixed(2)}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <select disabled className="select_supplier" style={{ margin: 0, fontSize: 13, fontWeight: 700, paddingLeft: 5, border: 0 }}>
                                <option value="">No Vat</option>
                              </select>
                            </td>
                            <td>
                              <input disabled style={{ marginBottom: 0, fontSize: 13, color: "black", width: "50px", border: "0px", verticalAlign: "middle" }} placeholder="0.00%" />
                            </td>
                            <td>
                              <input disabled style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }} value={formatValue(cfsCalc.discount)} className="supplier_form" />
                            </td>
                            <td>
                              <input disabled style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }} value={formatValue(cfsCalc.exclusive)} className="supplier_form" />
                            </td>
                            <td>
                              <input disabled style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }} value={formatValue(cfsCalc.vat)} className="supplier_form" />
                            </td>
                          </tr>
                        )}

                        {!isNaN(finalvlaueodoc) && finalvlaueodoc !== 0 && (
                          <tr>
                            <td>Documentation Fee</td>
                            <td>
                              <input
                                style={{
                                  marginBottom: 0,
                                  fontSize: 13,
                                  color: "black",
                                  fontWeight: 400,
                                  border: "0px",

                                  verticalAlign: "middle",
                                }}
                                type="text"
                                className="supplier_form"
                                onChange={handlechangecalc}
                                value={
                                  freight?.origin_pick_up_documantation_unitTypeQTY
                                }
                                name="origin_pick_up_documantation_unitTypeQTY"
                                id="floatingInput"
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <select
                                className="select_supplier"
                                style={{
                                  margin: 0,
                                  fontSize: 13,
                                  fontWeight: 700,
                                  paddingLeft: 5,
                                  border: 0,
                                }}
                                onChange={handlechangecalc}
                                name="origin_pick_up_documantation_unitType"
                                value={
                                  freight?.origin_pick_up_documantation_unitType
                                }
                              >
                                <option>Select</option>
                                <option value="1">L/S</option>
                                <option value="2">W/M</option>
                              </select>
                            </td>
                            <td>
                              <input
                                style={{
                                  marginBottom: 0,
                                  fontSize: 13,
                                  color: "black",
                                  fontWeight: 400,
                                  border: "0px",

                                  verticalAlign: "middle",
                                }}
                                type="text"
                                onKeyPress={handlepresss}
                                disabled
                                className="supplier_form"
                                onChange={handlechangecalc}
                                value={
                                  freight.origin_pick_up_documantation_unitType
                                    ? oridoc2
                                      ? oridoc2
                                      : 0
                                    : 0.0
                                }
                                name="origin_pick_up_documantation_fees"
                                id="floatingInput"
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <input
                                style={{
                                  marginBottom: 0,
                                  fontSize: 13,
                                  color: "black",
                                  fontWeight: 400,
                                  border: "0px",

                                  verticalAlign: "middle",
                                }}
                                type="text"
                                onKeyPress={handlepresss}
                                className="supplier_form"
                                onChange={handlechangecalc}
                                value={freight?.origin_pick_up_documantion_cost}
                                name="origin_pick_up_documantion_cost"
                                id="floatingInput"
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <select
                                className="select_supplier"
                                style={{
                                  margin: 0,
                                  fontSize: 13,
                                  fontWeight: 700,
                                  paddingLeft: 5,
                                  border: 0,
                                }}
                                onChange={handlechangecalc}
                                name="pickup_freight_currency"
                                value={freight?.pickup_freight_currency}
                              >
                                <option>Select</option>
                                <option value="RAND">RAND</option>
                                <option value="USD">USD</option>
                                <option value="INR">INR</option>
                                <option value="EURO">EURO</option>
                              </select>
                            </td>
                            <td>
                              <input
                                style={{
                                  marginBottom: 0,
                                  fontSize: 13,
                                  color: "black",

                                  border: "0px",
                                  verticalAlign: "middle",
                                }}
                                onChange={handlechangecalc}
                                name="roe_origin_doc_currency"
                                value={freight.roe_origin_doc_currency}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <input
                                style={{
                                  marginBottom: 0,
                                  fontSize: 13,
                                  color: "black",

                                  border: "0px",
                                  verticalAlign: "middle",
                                }}
                                disabled
                                value={
                                  isNaN(finalvlaueodoc)
                                    ? 0
                                    : finalvlaueodoc.toFixed(2)
                                }
                                placeholder="0.00"
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <select disabled className="select_supplier" style={{ margin: 0, fontSize: 13, fontWeight: 700, paddingLeft: 5, border: 0 }}>
                                <option value="">No Vat</option>
                              </select>
                            </td>
                            <td>
                              <input disabled style={{ marginBottom: 0, fontSize: 13, color: "black", width: "50px", border: "0px", verticalAlign: "middle" }} placeholder="0.00%" />
                            </td>
                            <td>
                              <input disabled style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }} value={formatValue(docCalc.discount)} className="supplier_form" />
                            </td>
                            <td>
                              <input disabled style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }} value={formatValue(docCalc.exclusive)} className="supplier_form" />
                            </td>
                            <td>
                              <input disabled style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }} value={formatValue(docCalc.vat)} className="supplier_form" />
                            </td>
                          </tr>
                        )}

                        {!isNaN(finalvlaueoforewarding) &&
                          finalvlaueoforewarding !== 0 && (
                            <tr>
                              <td>Forwarding Fee</td>
                              <td>
                                <input
                                  style={{
                                    marginBottom: 0,
                                    fontSize: 13,
                                    color: "black",
                                    fontWeight: 400,
                                    border: "0px",

                                    verticalAlign: "middle",
                                  }}
                                  type="text"
                                  className="supplier_form"
                                  onChange={handlechangecalc}
                                  value={
                                    freight?.origin_pick_up_forewarding_unitTypeQTY
                                  }
                                  name="origin_pick_up_forewarding_unitTypeQTY"
                                  id="floatingInput"
                                  placeholder="0.00"
                                />
                              </td>
                              <td>
                                <select
                                  className="select_supplier"
                                  style={{
                                    margin: 0,
                                    fontSize: 13,
                                    fontWeight: 700,
                                    paddingLeft: 5,
                                    border: 0,
                                  }}
                                  onChange={handlechangecalc}
                                  name="origin_pick_up_forewarding_unitType"
                                  value={freight?.origin_pick_up_forewarding_unitType}
                                >
                                  <option>Select</option>
                                  <option value="1">L/S</option>
                                  <option value="2">W/M</option>
                                </select>
                              </td>
                              <td>
                                <input
                                  style={{
                                    marginBottom: 0,
                                    fontSize: 13,
                                    color: "black",
                                    fontWeight: 400,
                                    border: "0px",

                                    verticalAlign: "middle",
                                  }}
                                  type="text"
                                  onKeyPress={handlepresss}
                                  className="supplier_form"
                                  disabled
                                  onChange={handlechangecalc}
                                  value={
                                    freight.origin_pick_up_forewarding_unitType
                                      ? oriforewarding2
                                        ? oriforewarding2
                                        : 0
                                      : 0
                                  }
                                  name="origin_pick_up_forewarding_fees"
                                  id="floatingInput"
                                  placeholder="0.00"
                                />
                              </td>
                              <td>
                                <input
                                  style={{
                                    marginBottom: 0,
                                    fontSize: 13,
                                    color: "black",
                                    fontWeight: 400,
                                    border: "0px",

                                    verticalAlign: "middle",
                                  }}
                                  type="text"
                                  onKeyPress={handlepresss}
                                  className="supplier_form"
                                  onChange={handlechangecalc}
                                  value={freight?.origin_pick_up_forewarding_cost}
                                  name="origin_pick_up_forewarding_cost"
                                  id="floatingInput"
                                  placeholder="0.00"
                                />
                              </td>
                              <td>
                                <select
                                  className="select_supplier"
                                  style={{
                                    margin: 0,
                                    fontSize: 13,
                                    fontWeight: 700,
                                    paddingLeft: 5,
                                    border: 0,
                                  }}
                                  onChange={handlechangecalc}
                                  name="pickup_freight_currency"
                                  value={freight?.pickup_freight_currency}
                                >
                                  <option>Select</option>
                                  <option value="RAND">RAND</option>
                                  <option value="USD">USD</option>
                                  <option value="INR">INR</option>
                                  <option value="EURO">EURO</option>
                                </select>
                              </td>
                              <td>
                                <input
                                  style={{
                                    marginBottom: 0,
                                    fontSize: 13,
                                    color: "black",

                                    border: "0px",
                                    verticalAlign: "middle",
                                  }}
                                  name="roe_origin_forewarding"
                                  value={freight.roe_origin_forewarding}
                                  onChange={handlechangecalc}
                                  className="supplier_form"
                                />
                              </td>
                              <td>
                                <input
                                  style={{
                                    marginBottom: 0,
                                    fontSize: 13,
                                    color: "black",

                                    border: "0px",
                                    verticalAlign: "middle",
                                  }}
                                  disabled
                                  value={
                                    isNaN(finalvlaueoforewarding)
                                      ? 0
                                      : finalvlaueoforewarding.toFixed(2)
                                  }
                                  placeholder="0.00"
                                  className="supplier_form"
                                />
                              </td>
                              <td>
                                <select disabled className="select_supplier" style={{ margin: 0, fontSize: 13, fontWeight: 700, paddingLeft: 5, border: 0 }}>
                                  <option value="">No Vat</option>
                                </select>
                              </td>
                              <td>
                                <input disabled style={{ marginBottom: 0, fontSize: 13, color: "black", width: "50px", border: "0px", verticalAlign: "middle" }} placeholder="0.00%" />
                              </td>
                              <td>
                                <input disabled style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }} value={formatValue(forwardingCalc.discount)} className="supplier_form" />
                              </td>
                              <td>
                                <input disabled style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }} value={formatValue(forwardingCalc.exclusive)} className="supplier_form" />
                              </td>
                              <td>
                                <input disabled style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }} value={formatValue(forwardingCalc.vat)} className="supplier_form" />
                              </td>
                            </tr>
                          )}

                        {!isNaN(finalvlaueoCustomes) &&
                          finalvlaueoCustomes !== 0 && (
                            <tr>
                              <td>Customs Clearance</td>
                              <td>
                                <input
                                  style={{
                                    marginBottom: 0,
                                    fontSize: 13,
                                    color: "black",
                                    fontWeight: 400,
                                    border: "0px",

                                    verticalAlign: "middle",
                                  }}
                                  type="text"
                                  className="supplier_form"
                                  onChange={handlechangecalc}
                                  value={freight?.origin_pick_up_custome_unitTypeQTY}
                                  name="origin_pick_up_custome_unitTypeQTY"
                                  id="floatingInput"
                                  placeholder="0.00"
                                />
                              </td>
                              <td>
                                <select
                                  className="select_supplier"
                                  style={{
                                    margin: 0,
                                    fontSize: 13,
                                    fontWeight: 700,
                                    paddingLeft: 5,
                                    border: 0,
                                  }}
                                  onChange={handlechangecalc}
                                  name="origin_pick_up_custome_unitType"
                                  value={freight?.origin_pick_up_custome_unitType}
                                >
                                  <option>Select</option>
                                  <option value="1">L/S</option>
                                  <option value="2">W/M</option>
                                </select>
                              </td>
                              <td>
                                <input
                                  style={{
                                    marginBottom: 0,
                                    fontSize: 13,
                                    color: "black",
                                    fontWeight: 400,
                                    border: "0px",

                                    verticalAlign: "middle",
                                  }}
                                  type="text"
                                  onKeyPress={handlepresss}
                                  className="supplier_form"
                                  disabled
                                  onChange={handlechangecalc}
                                  value={
                                    freight.origin_pick_up_custome_unitType
                                      ? oricustome2
                                        ? oricustome2
                                        : 0.0
                                      : 0.0
                                  }
                                  name="origin_pick_up_custome_clearance"
                                  id="floatingInput"
                                  placeholder="0.00"
                                />
                              </td>
                              <td>
                                <input
                                  style={{
                                    marginBottom: 0,
                                    fontSize: 13,
                                    color: "black",
                                    fontWeight: 400,
                                    border: "0px",

                                    verticalAlign: "middle",
                                  }}
                                  type="text"
                                  onKeyPress={handlepresss}
                                  className="supplier_form"
                                  onChange={handlechangecalc}
                                  value={freight?.origin_pick_up_custome_cost}
                                  name="origin_pick_up_custome_cost"
                                  id="floatingInput"
                                  placeholder="0.00"
                                />
                              </td>
                              <td>
                                <select
                                  className="select_supplier"
                                  style={{
                                    margin: 0,
                                    fontSize: 13,
                                    fontWeight: 700,
                                    paddingLeft: 5,
                                    border: 0,
                                  }}
                                  onChange={handlechangecalc}
                                  name="pickup_freight_currency"
                                  value={freight?.pickup_freight_currency}
                                >
                                  <option>Select</option>
                                  <option value="RAND">RAND</option>
                                  <option value="USD">USD</option>
                                  <option value="INR">INR</option>
                                  <option value="EURO">EURO</option>
                                </select>
                              </td>
                              <td>
                                <input
                                  style={{
                                    marginBottom: 0,
                                    fontSize: 13,
                                    color: "black",

                                    border: "0px",
                                    verticalAlign: "middle",
                                  }}
                                  onChange={handlechangecalc}
                                  name="roe_origin_customes"
                                  value={freight.roe_origin_customes}
                                  className="supplier_form"
                                />
                              </td>
                              <td>
                                <input
                                  style={{
                                    marginBottom: 0,
                                    fontSize: 13,
                                    color: "black",

                                    border: "0px",
                                    verticalAlign: "middle",
                                  }}
                                  disabled
                                  value={
                                    isNaN(finalvlaueoCustomes)
                                      ? 0
                                      : finalvlaueoCustomes.toFixed(2)
                                  }
                                  placeholder="0.00"
                                  className="supplier_form"
                                />
                              </td>
                              <td>
                                <select disabled className="select_supplier" style={{ margin: 0, fontSize: 13, fontWeight: 700, paddingLeft: 5, border: 0 }}>
                                  <option value="">No Vat</option>
                                </select>
                              </td>
                              <td>
                                <input disabled style={{ marginBottom: 0, fontSize: 13, color: "black", width: "50px", border: "0px", verticalAlign: "middle" }} placeholder="0.00%" />
                              </td>
                              <td>
                                <input disabled style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }} value={formatValue(customsCalc.discount)} className="supplier_form" />
                              </td>
                              <td>
                                <input disabled style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }} value={formatValue(customsCalc.exclusive)} className="supplier_form" />
                              </td>
                              <td>
                                <input disabled style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }} value={formatValue(customsCalc.vat)} className="supplier_form" />
                              </td>
                            </tr>
                          )}

                        <tr>
                          <td colSpan={7}>
                            <strong>Total - Origin Charges </strong>
                          </td>
                          <td> {formatValue(totalChangeRoeOrigin)} </td>
                          <td></td>
                          <td></td>
                          <td> {formatValue(totalOriginDiscount)} </td>
                          <td> {formatValue(totalOriginExclusive)} </td>
                          <td> {formatValue(totalOriginVat)} </td>
                        </tr>
                      </tbody>
                    </table>
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
        </div>
      </div>
    </>
  );
}
