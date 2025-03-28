import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
} from "@mui/material";
import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newTicket, setNewTicket] = useState({
    Priority: "",
    Status: "",
    "S. No.": "",
    Name: "",
    "Contact No.": "",
    Device: "",
    "Issues/Demands": "",
    "$$$": "",
    Service: "",
    "Parts Used": "",
    Called: "",
    Notes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "tickets"));
        const tickets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setData(tickets);
      } catch (error) {
        console.error("Error loading tickets:", error);
      }
    };
    fetchData();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    setNewTicket({ ...newTicket, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const docRef = await addDoc(collection(db, "tickets"), newTicket);
      setData([...data, { id: docRef.id, ...newTicket }]);
      setOpen(false);
    } catch (error) {
      console.error("Error adding ticket:", error);
    }
  };

  const filteredData = data.filter(ticket =>
    Object.values(ticket).some(value =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Create Ticket
        </Button>
        <TextField
        className="bg-white rounded-lg h-12 text-xs"

          placeholder="Search..."
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create Ticket</DialogTitle>
        <DialogContent>
          {Object.keys(newTicket).map((key) => (
            <TextField
              key={key}
              margin="dense"
              label={key}
              name={key}
              fullWidth
              onChange={handleChange}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      {filteredData.length === 0 ? (
        <Alert severity="error">No matching tickets found.</Alert>
      ) : (
        <TableContainer className="mt-10" component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {Object.keys(newTicket).map((key) => (
                  <TableCell key={key} sx={{ fontWeight: "bold" }}>{key}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((row, index) => (
                <TableRow key={index}>
                  {Object.keys(newTicket).map((key) => (
                    <TableCell key={key}>{row[key]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
