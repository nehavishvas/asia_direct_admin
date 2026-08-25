import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Modal,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import CloseIcon from "@mui/icons-material/Close";
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  width: "400px",
};
const pageSize = 10;
export default function CountryOfOrigin({ countryID = null }) {
  const [country, setCountry] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountryID, setSelectedCountryID] = useState(countryID);
  const [selectedCities1, setSelectedCities1] = useState([]);
  const [selectedCities2, setSelectedCities2] = useState([]);
  const [show, setShow] = useState(false);
  const [selectedCities3, setSelectedCities3] = useState([]);
  const [selectedCities4, setSelectedCities4] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [currentData, setCurrentData] = useState([]);
  const [search, setSearch] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [personName, setPersonName] = React.useState([]);
  const [personName1, setPersonName1] = React.useState([]);
  const [personName2, setPersonName2] = React.useState([]);
  const [personName3, setPersonName3] = React.useState([]);
  const oncloseModal = () => {
    setOpen(!open);
  };
  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setPersonName(
      typeof value === "string" ? value.split(",").map(Number) : value
    );
  };
  const handleChange1 = (event) => {
    const {
      target: { value },
    } = event;
    setPersonName1(
      typeof value === "string" ? value.split(",").map(Number) : value
    );
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const handleChange2 = (event) => {
    const {
      target: { value },
    } = event;
    setPersonName2(
      typeof value === "string" ? value.split(",").map(Number) : value
    );
  };
  const handleChange3 = (event) => {
    const {
      target: { value },
    } = event;
    setPersonName3(
      typeof value === "string" ? value.split(",").map(Number) : value
    );
  };
  useEffect(() => {
    fetchCountries();
    if (countryID) loadCountryData(countryID);
  }, [countryID]);

  const fetchCountries = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}GetCountries`)
      .then((response) => setCountry(response.data.data))
      .catch((error) => console.error(error.response.data));
  };

  const fetchCities = (countryID) => {
    axios
      .get(
        `${process.env.REACT_APP_BASE_URL}GetCitiesByCountry?country_id=${countryID}`
      )
      .then((response) => {
        setCities(response.data.data);
        if (response.data.success === true) {
          setShow(response.data);
        }
      })
      .catch((error) => console.error(error.response.data));
  };

  const loadCountryData = (id) => {
    axios
      .get(
        `${process.env.REACT_APP_BASE_URL}GetCountryDetails?country_id=${id}`
      )
      .then((response) => {
        const data = response.data;
        setSelectedCountryID(data.country_id);
        setSelectedCities1(data.cities.map((city) => city.name));
        setSelectedCities2(data.sea_ports.map((port) => port.name));
        setSelectedCities3(data.air_ports.map((port) => port.name));
        setSelectedCities4(data.land_ports.map((port) => port.name));
        fetchCities(data.country_id);
      })
      .catch((error) => console.error(error.response.data));
  };

  const handleCountryChange = (e) => {
    const countryID = e.target.value;
    setSelectedCountryID(countryID);
    fetchCities(countryID);
  };

  const handleAdd = () => {
    setSelectedCountryID("");
    setSelectedCities1([]);
    setSelectedCities2([]);
    setSelectedCities3([]);
    setSelectedCities4([]);
    setIsEditMode(false);
    setOpen(true);
  };
  console.log(personName);
  const handleUpdate = (item) => {
    console.log(item);
    setPersonName(item.cities.map((city) => Number(city.id)));
    setPersonName1(item.sea_ports.map((city) => Number(city.id)));
    setPersonName2(item.air_ports.map((city) => Number(city.id)));
    setPersonName3(item.land_ports.map((city) => Number(city.id)));
    setSelectedCountryID(item.country_id);
    setSelectedCities1(item.cities.map((city) => city.name));
    setSelectedCities2(item.sea_ports.map((port) => port.name));
    setSelectedCities3(item.air_ports.map((port) => port.name));
    setSelectedCities4(item.land_ports.map((port) => port.name));
    fetchCities(item.country_id);
    setIsEditMode(true);
    setOpen(true);
  };

  const handleSave = () => {
    console.log(personName);
    const dataToSend = {
      country_id: selectedCountryID,
      cities: personName,
      sea_ports: personName1,
      air_ports: personName2,
      land_ports: personName3,
    };
    console.log(dataToSend);
    const request = isEditMode
      ? axios.post(
        `${process.env.REACT_APP_BASE_URL}update-country`,
        dataToSend
      )
      : axios.post(`${process.env.REACT_APP_BASE_URL}add-country`, dataToSend);
    request
      .then((response) => {
        toast.success(response.data.message);
        setOpen(false); // Close modal after saving
        getdata(currentPage) // Reload data to update the table
      })
      .catch((error) => toast.error(error.response.data.message));
  };

  const getdata = (page = 1, search = "") => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}country-list`, {
        page: page,
        limit: pageSize,
        search: search, // 👈 search key
      })
      .then((response) => {
        setCurrentData(response.data.data || []);
        setTotalPages(response.data.total_pages || 1);
      })
      .catch((error) => console.log(error.response?.data));
  };
  useEffect(() => {
    getdata(currentPage, search); // ✅ search pass karo
  }, [currentPage, search]);

  const currentdata = currentData;

  const handledelete = (item) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post(`${process.env.REACT_APP_BASE_URL}delete-country`, {
            country_id: item.id,
          })
          .then((response) => {
            toast.success(response.data.message);
            getdata(currentPage)
          })
          .catch((error) => {
            toast.error(error.response.data.message);
          });
        Swal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          icon: "success",
        });
      }
    });
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      getdata(currentPage, search);
    }, 500);

    return () => clearTimeout(delay);
  }, [currentPage, search]);
  return (
    <div className="wpWrapper">
      <div className="container-fluid">
        <div className=" ">
          <div className=" ">
            <div className="row manageFreight">
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="">
                    <h4 className="freight_hd">Country of Origin</h4>
                  </div>
                  <div className="d-flex gap-2">
                    <div className="searchManageFre">

                      <input
                        type="text"
                        placeholder="Search country..."
                        className="form-control"
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setCurrentPage(1); // 👈 reset page
                        }}
                      />
                    </div>
                    <div>


                      <button
                        className="blueBtn"
                        onClick={handleAdd}
                        variant="contained"
                        color="primary"
                      >
                        Add Country
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Modal open={open} onClose={() => setOpen(false)}>
              <Box sx={style}>
                <div className="modal-header">
                  <h2 id="modal-modal-title">
                    {isEditMode ? "Update Country" : "Add Country"}
                  </h2>
                  <button className="btn btn-close" onClick={oncloseModal}>
                    <CloseIcon />
                  </button>
                </div>
                <div className="newModalGap">
                  <FormControl fullWidth margin="normal" className="mb-3">
                    <InputLabel>Country</InputLabel>
                    <Select
                      value={selectedCountryID || ""}
                      onChange={handleCountryChange}
                      label="Country"
                      className="country_sel"
                    >
                      <MenuItem value="">Select Country...</MenuItem>
                      {country.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {show ? (
                    <>
                      <FormControl fullWidth className="mb-3">
                        <InputLabel id="demo-multiple-checkbox-label">
                          Cities
                        </InputLabel>
                        <Select
                          labelId="demo-multiple-checkbox-label"
                          className="country_sel"
                          id="demo-multiple-checkbox"
                          multiple
                          value={personName}
                          onChange={handleChange}
                          input={<OutlinedInput label="Cities" />}
                          renderValue={(selected) =>
                            selected
                              .map((id) => {
                                const person = cities.find((n) => n.id === id);
                                return person ? `${person.name}` : "";
                              })
                              .join(",")
                          }
                          MenuProps={MenuProps}
                        >
                          {cities.map(({ id, name }) => (
                            <MenuItem key={id} value={id}>
                              <Checkbox checked={personName.includes(id)} />
                              <ListItemText primary={`${name}`} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth className="mb-3">
                        <InputLabel id="demo-multiple-checkbox-label">
                          Sea Ports
                        </InputLabel>
                        <Select
                          labelId="demo-multiple-checkbox-label"
                          className="country_sel"
                          id="demo-multiple-checkbox"
                          multiple
                          value={personName1}
                          onChange={handleChange1}
                          input={<OutlinedInput label="Sea Ports" />}
                          renderValue={(selected) =>
                            selected
                              .map((id) => {
                                const person = cities.find((n) => n.id === id);
                                return person ? `${person.name}` : "";
                              })
                              .join(", ")
                          }
                          fullWidth
                          MenuProps={MenuProps}
                        >
                          {cities.map(({ id, name }) => (
                            <MenuItem key={id} value={id}>
                              <Checkbox checked={personName1.includes(id)} />
                              <ListItemText primary={name} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl fullWidth className="mb-3">
                        <InputLabel id="demo-multiple-checkbox-label">
                          Air Ports
                        </InputLabel>
                        <Select
                          labelId="demo-multiple-checkbox-label"
                          id="demo-multiple-checkbox"
                          className="country_sel"
                          multiple
                          value={personName2}
                          onChange={handleChange2}
                          input={<OutlinedInput label="Air Ports" />}
                          renderValue={(selected) =>
                            selected
                              .map((id) => {
                                const person = cities.find((n) => n.id === id);
                                return person ? `${person.name}` : "";
                              })
                              .join(",")
                          }
                          MenuProps={MenuProps}
                        >
                          {cities.map(({ id, name }) => (
                            <MenuItem key={id} value={id}>
                              <Checkbox checked={personName2.includes(id)} />
                              <ListItemText primary={`${name}`} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl fullWidth className="mb-3">
                        <InputLabel id="demo-multiple-checkbox-label">
                          Land Ports
                        </InputLabel>
                        <Select
                          labelId="demo-multiple-checkbox-label"
                          id="demo-multiple-checkbox"
                          className="country_sel"
                          multiple
                          value={personName3}
                          onChange={handleChange3}
                          input={<OutlinedInput label="Land Ports" />}
                          renderValue={(selected) =>
                            selected
                              .map((id) => {
                                const person = cities.find((n) => n.id === id);
                                return person ? `${person.name}` : "";
                              })
                              .join(",")
                          }
                          MenuProps={MenuProps}
                        >
                          {cities.map(({ id, name }) => (
                            <MenuItem key={id} value={id}>
                              <Checkbox checked={personName3.includes(id)} />
                              <ListItemText primary={`${name}`} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </>
                  ) : (
                    ""
                  )}
                  {errorMessage && (
                    <div style={{ color: "red", marginTop: "10px" }}>
                      {errorMessage}
                    </div>
                  )}
                  <div className="d-flex justify-content-center unsetLt">
                    <Button
                      onClick={handleSave}
                      variant="contained"
                      color="primary"
                    >
                      {isEditMode ? "Update Country" : "Add Country"}
                    </Button>
                  </div>
                </div>
              </Box>
            </Modal>
            <TableContainer component={Paper} className="my-3">
              <div style={{ overflowX: "auto" }}>
                <Table className="batch_table">
                  <TableHead>
                    <TableRow className="border-bottom">
                      <TableCell className="fw-bold">Sr.No.</TableCell>
                      <TableCell className="fw-bold">Country Name</TableCell>
                      <TableCell className="fw-bold">Cities</TableCell>
                      <TableCell className="fw-bold">Sea Ports</TableCell>
                      <TableCell className="fw-bold">Air Ports</TableCell>
                      <TableCell className="fw-bold">Land Ports</TableCell>
                      <TableCell className="fw-bold">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentdata &&
                      currentdata.map((item, index) => (
                        <TableRow key={index} className="border-bottom">
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{item?.country_name}</TableCell>
                          <TableCell className="col-3">
                            {item.cities.map((city) => city.name).join(", ")}
                          </TableCell>
                          <TableCell>
                            {item.sea_ports.map((port) => port.name).join(", ")}
                          </TableCell>
                          <TableCell>
                            {item.air_ports.map((port) => port.name).join(", ")}
                          </TableCell>
                          <TableCell>
                            {item.land_ports
                              .map((port) => port.name)
                              .join(", ")}
                          </TableCell>
                          <TableCell>
                            <FaEdit
                              className="fs-6"
                              style={{ color: "rgb(27 34 69)" }}
                              onClick={() => handleUpdate(item)}
                            />
                            <DeleteIcon
                              className="fs-5 text-danger ms-2"
                              onClick={() => handledelete(item)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TableContainer>
            <div className="text-center d-flex justify-content-end align-items-center">
              <button
                disabled={currentPage === 1}
                className="bg_page"
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                <i class="fi fi-rr-angle-small-left page_icon"></i>
              </button>

              <span className="mx-2">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                className="bg_page"
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                <i class="fi fi-rr-angle-small-right page_icon"></i>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
