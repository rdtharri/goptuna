import React, { FC } from "react"
import { Link } from "react-router-dom"
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles"
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  Grid,
  Box,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
} from "@material-ui/core"

import { actionCreator } from "../action"
import { useSnackbar } from "notistack"
import { useStudySummaries } from "../hook"
import { DataGrid, DataGridColumn } from "./dataGrid"
import { AddBox } from "@material-ui/icons"
import {studySummariesState} from "../state";
import {useSetRecoilState} from "recoil";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    card: {
      margin: theme.spacing(2),
    },
    grow: {
      flexGrow: 1,
    },
  })
)

export const StudyList: FC<{}> = () => {
  const classes = useStyles()
  const [openDialog, setOpenDialog] = React.useState(false)
  const [newStudyName, setNewStudyName] = React.useState("")

  const { enqueueSnackbar } = useSnackbar()
  const action = actionCreator(enqueueSnackbar)
  const studies = useStudySummaries(action)
  const setStudies = useSetRecoilState<StudySummary[]>(studySummariesState)

  const columns: DataGridColumn<StudySummary>[] = [
    {
      field: "study_id",
      label: "Study ID",
      sortable: true,
    },
    {
      field: "study_name",
      label: "Name",
      sortable: true,
      toCellValue: (i) => (
        <Link to={`${URL_PREFIX}/studies/${studies[i].study_id}`}>
          {studies[i].study_name}
        </Link>
      ),
    },
    {
      field: "direction",
      label: "Direction",
      sortable: false,
      toCellValue: (i) => studies[i].direction.toString(),
    },
    {
      field: "best_trial",
      label: "Best value",
      sortable: false,
      toCellValue: (i) => studies[i].best_trial?.value || null,
    },
  ]

  const collapseAttrColumns: DataGridColumn<Attribute>[] = [
    { field: "key", label: "Key", sortable: true },
    { field: "value", label: "Value", sortable: true },
  ]

  const handleCloseNewStudyDialog = () => {
    setNewStudyName("")
    setOpenDialog(false)
  }

  const handleCreateNewStudy = () => {
    // TODO(c-bata): Add choice field for direction
    action.createNewStudy(newStudyName, "minimize", studies, setStudies)
    setOpenDialog(false)
  }

  const collapseBody = (index: number) => {
    return (
      <Grid container direction="row">
        <Grid item xs={6}>
          <Box margin={1}>
            <Typography variant="h6" gutterBottom component="div">
              Study user attributes
            </Typography>
            <DataGrid<Attribute>
              columns={collapseAttrColumns}
              rows={studies[index].user_attrs}
              keyField={"key"}
              dense={true}
              initialRowsPerPage={5}
              rowsPerPageOption={[5, 10, { label: "All", value: -1 }]}
            />
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box margin={1}>
            <Typography variant="h6" gutterBottom component="div">
              Study system attributes
            </Typography>
            <DataGrid<Attribute>
              columns={collapseAttrColumns}
              rows={studies[index].system_attrs}
              keyField={"key"}
              dense={true}
              initialRowsPerPage={5}
              rowsPerPageOption={[5, 10, { label: "All", value: -1 }]}
            />
          </Box>
        </Grid>
      </Grid>
    )
  }

  return (
    <div>
      <AppBar position="static">
        <Container>
          <Toolbar>
            <Typography variant="h6">Goptuna dashboard</Typography>
            <div className={classes.grow} />
            <IconButton
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={(e) => {
                setOpenDialog(true)
              }}
              color="inherit"
            >
              <AddBox />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>
      <Container>
        <Card className={classes.card}>
          <DataGrid<StudySummary>
            columns={columns}
            rows={studies}
            keyField={"study_id"}
            collapseBody={collapseBody}
            initialRowsPerPage={5}
            rowsPerPageOption={[5, 10, { label: "All", value: -1 }]}
          />
        </Card>
      </Container>
      <Dialog
        open={openDialog}
        onClose={(e) => handleCloseNewStudyDialog}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">New study</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To create a new study, please enter the study name here.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Study name"
            type="text"
            onChange={(e) => {
              setNewStudyName(e.target.value)
            }}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewStudyDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreateNewStudy} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
