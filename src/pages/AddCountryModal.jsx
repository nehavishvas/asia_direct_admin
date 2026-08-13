import React from "react";
import {
  Box, Button, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, Modal,} from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
const AddCountryModal = ({ open, onClose, refreshData }) => {
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [cityMap, setCityMap] = useState({});
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedSeaPort, setSelectedSeaPort] = useState([]);
  const [selectedAirPort, setSelectedAirPort] = useState([]);
  const [selectedLandPort, setSelectedLandPort] = useState([]);
  useEffect(() => {
    if (open) {
      getCountries();
    }
  }, [open]);
  const getCountries = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}GetCountries`)
      .then((response) => setCountries(response.data.data))
      .catch((error) => console.log(error.response.data));
  };
  const getCities = (countryId) => {
    axios
      .get(
        `${process.env.REACT_APP_BASE_URL}GetCitiesByCountry?country_id=${countryId}`
      )
      .then((response) => {
        const citiesData = response.data.data;
        setCities(citiesData);
        const map = citiesData.reduce((acc, city) => {
          acc[city.id] = city.name;
          return acc;
        }, {});
        setCityMap(map);
      })
      .catch((error) => console.log(error.response.data));
  };
  const handleCountryChange = (event) => {
    const countryId = event.target.value;
    setSelectedCountry(countryId);
    setCities([]);
    setCityMap({});
    setSelectedCities([]);
    setSelectedSeaPort([]);
    setSelectedAirPort([]);
    setSelectedLandPort([]);
    if (countryId) {
      getCities(countryId);
    }
  };
  const handleMultiSelectChange = (event, setFunction) => {
    const {
      target: { value },
    } = event;
    setFunction(typeof value === "string" ? value.split(",") : value);
  };
  const validateForm = () => {
    if (!selectedCountry) {
      toast.error("Please select a country.");
      return false;
    }
    if (selectedCities.length === 0) {
      toast.error("Please select at least one city.");
      return false;
    }
    if (
      selectedSeaPort.length === 0 ||
      selectedAirPort.length === 0 ||
      selectedLandPort.length === 0
    ) {
      toast.error(
        "Please select at least one sea port, air port, and land port."
      );
      return false;
    }
    return true;
  };
  const postData = () => {
    if (validateForm()) {
      const data = {
        country_id: selectedCountry,
        cities: selectedCities,
        sea_ports: selectedSeaPort,
        air_ports: selectedAirPort,
        land_ports: selectedLandPort,
      };
      axios
        .post(`${process.env.REACT_APP_BASE_URL}add-country`, data)
        .then((response) => {
          toast.success("Country of Origin added successfully.");
          onClose();
          refreshData();
        })
        .catch((error) => {
          toast.error("Failed to add Country of Origin.");
          console.log(error.response.data);
        });
    }
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          height: "70vh",
          width: 550,
          overflow: "scroll",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
        }}>
        <h4 id="modal-title">Add Country</h4>
        <Box sx={{ minWidth: 120 }} className="mb-3">
          <FormControl fullWidth>
            <InputLabel id="country-select-label">Select Country</InputLabel>
            <Select
              labelId="country-select-label"
              id="country-select"
              value={selectedCountry}
              label="Select Country"
              onChange={handleCountryChange}
            >
              {countries.map((country) => (
                <MenuItem key={country.id} value={country.id}>
                  {country.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ minWidth: 120 }} className="mb-3">
          <FormControl fullWidth>
            <InputLabel id="city-select-label">Select Cities</InputLabel>
            <Select
              labelId="city-select-label"
              id="city-select"
              multiple
              label="Select Cities"
              value={selectedCities}
              onChange={(e) => handleMultiSelectChange(e, setSelectedCities)}
              renderValue={(selected) =>
                selected.map((id) => cityMap[id] || id).join(", ")
              }
            >
              {cities.map((city) => (
                <MenuItem key={city.id} value={city.id}>
                  <Checkbox checked={selectedCities.indexOf(city.id) > -1} />
                  <ListItemText primary={city.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ minWidth: 120 }} className="mb-3">
          <FormControl fullWidth>
            <InputLabel id="sea-port-select-label">Select Sea Ports</InputLabel>
            <Select
              labelId="sea-port-select-label"
              id="sea-port-select"
              multiple
              label="Select Sea Ports"
              value={selectedSeaPort}
              onChange={(e) => handleMultiSelectChange(e, setSelectedSeaPort)}
              renderValue={(selected) =>
                selected.map((id) => cityMap[id] || id).join(", ")
              }
            >
              {cities.map((port) => (
                <MenuItem key={port.id} value={port.id}>
                  <Checkbox checked={selectedSeaPort.indexOf(port.id) > -1} />
                  <ListItemText primary={port.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ minWidth: 120 }} className="mb-3">
          <FormControl fullWidth>
            <InputLabel id="air-port-select-label">Select Air Ports</InputLabel>
            <Select
              labelId="air-port-select-label"
              id="air-port-select"
              multiple
              label="Select Air Ports"
              value={selectedAirPort}
              onChange={(e) => handleMultiSelectChange(e, setSelectedAirPort)}
              renderValue={(selected) =>
                selected.map((id) => cityMap[id] || id).join(", ")
              }
            >
              {cities.map((port) => (
                <MenuItem key={port.id} value={port.id}>
                  <Checkbox checked={selectedAirPort.indexOf(port.id) > -1} />
                  <ListItemText primary={port.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ minWidth: 120 }} className="mb-3">
          <FormControl fullWidth>
            <InputLabel id="land-port-select-label">
              Select Land Ports
            </InputLabel>
            <Select
              labelId="land-port-select-label"
              id="land-port-select"
              multiple
              label="Select Land Ports"
              value={selectedLandPort}
              onChange={(e) => handleMultiSelectChange(e, setSelectedLandPort)}
              renderValue={(selected) =>
                selected.map((id) => cityMap[id] || id).join(", ")
              }>
              {cities.map((port) => (
                <MenuItem key={port.id} value={port.id}>
                  <Checkbox checked={selectedLandPort.indexOf(port.id) > -1} />
                  <ListItemText primary={port.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Button variant="contained" onClick={postData}>
          Submit
        </Button>
      </Box>
      
    </Modal>
  );
};
export default AddCountryModal;
