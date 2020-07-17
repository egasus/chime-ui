import React, { useState, useEffect } from "react";

import { withStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Card from "@material-ui/core/Card";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/AddCircle";
import EditIcon from "@material-ui/icons/Create";
import DeleteIcon from "@material-ui/icons/Delete";
import PlayIcon from "@material-ui/icons/PlayArrow";

import CreateEventModal from "components/modals/CreateEvent";
import EditEventModal from "components/modals/EditEvent";
import StartMeetingModal from "components/modals/StartMeeting";

import {
  getAllMeetingEvents,
  getAllUsers,
  createMeetingEvent,
  delMeetingEvent,
  updateMeetingEvent,
} from "apis";

import { MEETING_STATUS } from "config/constants";

const TITLES = [
  { title: "Title", key: "ch_title" },
  { title: "Instructor", key: "ch_instructor" },
  { title: "Scheduled Start", key: "ch_scheduled_start_date_time" },
  { title: "Scheduled End", key: "ch_scheduled_end_date_time" },
  { title: "Status", key: "ch_meeting_status" },
];

const muiStyles = () => ({
  title: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionIcons: {
    display: "flex",
    justifyContent: "flex-end",
  },
});

const Home = ({ classes }) => {
  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openJoin, setOpenJoin] = useState(false);
  const [editIndex, setEditIndex] = useState(0);
  const [openIndex, setOpenIndex] = useState(0);
  const [eventUpdated, setEventUpdated] = useState(false);

  const getAllEvents = async () => {
    try {
      const res = await getAllMeetingEvents();
      setEvents(res.data);
      setEventUpdated(!eventUpdated);
    } catch (error) {
      console.log("error", error);
    }
  };
  const getAllParticipants = async () => {
    try {
      const res = await getAllUsers();
      setParticipants(res.data);
    } catch (error) {
      console.log("error", error);
    }
  };
  const delEvent = async (id) => {
    try {
      const res = await delMeetingEvent(id);
      if (res) {
        getAllEvents();
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  const updateEvent = async (uuid, obj) => {
    try {
      const res = await updateMeetingEvent(uuid, obj);
      if (res) {
        getAllEvents();
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    getAllEvents();
    getAllParticipants();
  }, []);

  const isInstructor = (email) => email === localStorage.getItem("email");
  const getStatusLabel = (statusNumber) => {
    return MEETING_STATUS.find(
      ({ number }) => Number(statusNumber || 0) === Number(number)
    ).label;
  };

  return (
    <Box py={8}>
      <Card>
        <div className={classes.title}>
          <Typography>Scheduled Meetings</Typography>
          <IconButton onClick={() => setOpenCreate(true)}>
            <AddIcon color="primary" />
          </IconButton>
        </div>

        <br />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={"10%"} />
              {TITLES.map((column, idx) => (
                <TableCell key={`head-${idx}`}>{column.title}</TableCell>
              ))}
              <TableCell width={"13%"} alignItems="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event, idx) => (
              <TableRow key={`body-row-${idx}`}>
                <TableCell>
                  <IconButton
                    onClick={() => {
                      setOpenIndex(idx);
                      setOpenJoin(true);
                    }}
                  >
                    <PlayIcon />
                  </IconButton>
                </TableCell>
                {TITLES.map(({ key }, rIdx) => (
                  <TableCell key={`row-cell-${rIdx}`}>
                    {key !== "ch_meeting_status"
                      ? event[key]
                      : getStatusLabel(event[key])}
                  </TableCell>
                ))}
                <TableCell className={classes.actionIcons}>
                  <IconButton
                    disabled={!isInstructor(event.ch_instructor)}
                    onClick={() => {
                      setEditIndex(idx);
                      setOpenEdit(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    disabled={!isInstructor(event.ch_instructor)}
                    onClick={() => delEvent(events[idx].ch_event_uuid)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      {openCreate && (
        <CreateEventModal
          open={openCreate}
          participants={participants}
          handleClose={() => setOpenCreate(false)}
          onSave={async (event) => {
            try {
              const res = await createMeetingEvent(event);
              if (res) {
                getAllEvents();
              }
            } catch (error) {
              console.log("error", error);
            }
          }}
        />
      )}
      {openEdit && (
        <EditEventModal
          open={openEdit}
          event={events[editIndex]}
          participants={participants}
          handleClose={() => setOpenEdit(false)}
          onSave={async (uuid, event) => {
            try {
              await updateEvent(uuid, event);
            } catch (error) {
              console.log("error", error);
            }
          }}
        />
      )}
      {openJoin && (
        <StartMeetingModal
          open={openJoin}
          event={events[openIndex]}
          handleClose={() => setOpenJoin(false)}
        />
      )}
    </Box>
  );
};

export default withStyles(muiStyles)(Home);
