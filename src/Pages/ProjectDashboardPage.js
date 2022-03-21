import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Accordion,
  ListGroup,
  Button,
  Modal,
  Form,
  Card
} from "react-bootstrap";
import ProjectCardComponent from "../Components/ProjectCardComponent";
import NewProjectComponent from "../Components/NewProjectComponent";
import { faMagnifyingGlass, faUserPlus, faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { checkToken, getAllUsers, updateUser, getProjectItemsByUserId, getProjectItemsByAMemberUsername, getAllProjectItems, getProjectItemByTitle, updateUserRole, getTaskItemsByProjectID, createAccount, getProjectItemsByAMemberId } from "../Services/DataService";
import UserContext from '../Context/UserContext';
import ProjectContext from "../Context/ProjectContext";
import TaskContext from "../Context/TaskContext";


export default function ProjectDashboardPage() {
  let userData = useContext(UserContext);
  let clickedProject1 = useContext(ProjectContext);
  // console.log(userData.userItems)
  // console.log(userData.userItems.isSpecialist)

  const addUserIcon = <FontAwesomeIcon icon={faUserPlus} />
  const editIcon = <FontAwesomeIcon icon={faEdit} />
  let navigate = useNavigate();
  let { userId, setUserId, username, setUsername, isAdmin, setIsAdmin, isProjectManager, setIsProjectManager, isSpecialist, setIsSpecialist, fullName, setFullName, userItems, setUserItems } = useContext(UserContext);
  let { clickedProject, setClickedProject } = useContext(ProjectContext)
  const [currentClickedProject, setCurrentClickedProject] = useState({});

  const handleClick = async (e, project) => {
    let project1 = await getProjectItemByTitle(project.title);
    setClickedProject(project1);
    // console.log(clickedProject);
    let allTasks = await getTaskItemsByProjectID(project.id);
    // setAllTasks(allTasks);
    navigate("/taskDashboard");
  }

  // for admin edit userRoles modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  //for admin addUser modal
  const [show1, setShow1] = useState(false);
  const handleClose1 = () => setShow1(false);
  const handleShow1 = () => setShow1(true);

  const [currentProjects, setCurrentProjects] = useState([]);


  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState({});

  let allFetchedUsers;

  const setRole = async (value) => {
    // updatedUser = { 
    //   Id: user.id,
    //   Username: user.username,
    //   FullName: user.fullName,
    //   Salt: user.salt,
    //   Hash: user.hash,
    //   IsAdmin: value,
    //   IsProjectManager: value,
    //   IsSpecialist: value
    // }

    console.log(value);
    console.log(selectedUser.username);


    if (value == 'Admin') {
      updateUserRole(selectedUser.username, true, false, false);
    } else if (value == 'PM') {
      updateUserRole(selectedUser.username, false, true, false);
    } else if (value == 'Specialist') {
      updateUserRole(selectedUser.username, false, false, true);
    }

    allFetchedUsers = await getAllUsers();
    // console.log(allFetchedUsers)
    setAllUsers(allFetchedUsers);
  }

  //This is the modal for clicking edit button on task thing
  const [show2, setShow2] = useState(false);

  const handleClose2 = () => setShow2(false);
  const handleShow2 = () => {
    setShow2(true);

  }

  const handleClick2 = async (e, project) => {
    let project2 = await getProjectItemByTitle(project.title);
    setClickedProject(project2);
    console.log(clickedProject);
    // navigate("/taskDashboard");
    setCurrentClickedProject(project);
    console.log('asdfasdf')
    setShow2(true);
  }



  useEffect(async () => {

    allFetchedUsers = await getAllUsers();
    // console.log(allFetchedUsers)
    setAllUsers(allFetchedUsers);

    setTimeout(async () => {
      let currentFetchedProjects;
      console.log(userData.userItems);
      if (userData.userItems.isSpecialist) {
        currentFetchedProjects = await getProjectItemsByAMemberId(userItems.id)
        console.log("specialist")
      } else if (userData.userItems.isProjectManager) {
        currentFetchedProjects = await getProjectItemsByUserId(userItems.id);
        console.log("pm")
      } else {
        currentFetchedProjects = await getAllProjectItems();
        console.log("admin")

        console.log(userData.userItems);
      }
      // console.log(currentFetchedProjects);
      setCurrentProjects(currentFetchedProjects);

    }, 3000);

  }, [])



  //Function to show model when edit button is clicked

  const { viewIcon } = <FontAwesomeIcon icon={faMagnifyingGlass} />;
  return (
    <>
      <Container className="mt-5">
        <h4 className="headerTxt">Your Current Projects: </h4>
        <Row xs={2} lg={4} className="g-3">
          {
            userData.userItems.isAdmin ? (
              <NewProjectComponent />
            ) : null
          }
          {/* Map thru current projects here */}
          <Modal show={show2} onHide={handleClose2}>

            <Modal.Header closeButton>
              <Modal.Title>Edit Project</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Title</Form.Label>
                  <Form.Control type="text" placeholder="Edit Title" value={currentClickedProject.title} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="">
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" type="text" placeholder="Description" value={currentClickedProject.description} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Due Date</Form.Label>
                  <Form.Control type="date" placeholder="Password" value={currentClickedProject.dueDate} />
                </Form.Group>
                <Form.Label>Edit Specialist</Form.Label>
                <ListGroup as="ul">
                  {
                    allSpecialist.map((user, idx) => {
                      return (
                        <ListGroup.Item action as="li" onClick={() => addUserToArrayId(user.id)}>
                          {user.fullName}
                        </ListGroup.Item>
                      )
                    })
                  }
                </ListGroup>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose1}>
                Close
              </Button>
              <Button variant="primary" onClick={handleClose1}>
                Save Changes
              </Button>
            </Modal.Footer>
          </Modal>
          {/* need function that fetches all current projects of that user, but if user is an admin will show all projects */}
          {currentProjects.map((project, idx) => (
            <div>
              <Card border="danger" style={{ width: '15rem', height: '15rem' }} className="shadow">
                <Card.Body >
                  <Card.Title className="d-flex justify-content-between">{project.title}
                    <Button className="editBtn" onClick={(e) => handleClick2(e, project)}>{editIcon}</Button>



                  </Card.Title>
                  <Card.Text>
                    <p>Due Date: <span>{project.dueDate}</span></p>
                    <p>Priority: <span>whateverr</span></p>
                    <p>Status: <span>whateverrr</span></p>
                  </Card.Text>
                  {
                    userData.userItems.isAdmin || userData.userItems.isProjectManager ? (
                      <Row>
                        <Col>
                          <Button className="editBtn"
                            // onClick={() => navigate("/taskDashboard")}
                            onClick={(e) => handleClick(e, project)}
                          >View</Button>
                        </Col>
                        <Col>
                          <Button variant="info">Archive</Button>
                        </Col>
                      </Row>
                    ) : null
                  }
                </Card.Body>
              </Card>
            </div>
          ))}
        </Row>
      </Container>
      <Container>
        <Row className="mt-5">
          {/* Map thru archived projects here */}
          {/* should this be viewable to specialists or just admin and PM? */}
          <Accordion defaultActiveKey="1">
            <Accordion.Item eventKey="0">
              <Accordion.Header>Archived Projects{viewIcon}</Accordion.Header>
              <Accordion.Body>
                <ListGroup>
                  {currentProjects.map((item, i) => {
                    return (
                      <>
                        {item.isArchived ? (
                          <ListGroup.Item key={i} className="d-flex">
                            <Col>{item.Title}</Col>
                            <Col className=" d-flex justify-content-end">
                              <Button
                                className="editBtn"
                                // onClick={() => navigate("/taskDashboard")}
                                onClick={() => handleClick(item.Title)}
                              >
                                View Project {viewIcon}
                              </Button>
                            </Col>
                          </ListGroup.Item>
                        ) : null}
                      </>
                    );
                  })}
                </ListGroup>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Row>
      </Container>
      <div className="mb-5"></div>

    </>
  );
}
