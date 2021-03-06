import React from 'react';
import { Container, Grid, Divider, Button, Card, Loader } from 'semantic-ui-react';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import { _ } from 'lodash';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import FeedbackModal from './FeedbackModal';
import EmployerJobCard from './EmployerJobCard';
import EmployeeCard from './EmployeeCard';
import NewJobModal from './NewJobModal';
import HireHelperModal from './HireHelperModal';
import { Jobs } from '../../api/jobs/jobs';
import { Skills } from '../../api/skills/skills';
import { JobApplicants } from '../../api/jobApplicants/jobApplicants';
import { Categories } from '../../api/categories/categories';
import { Ratings } from '../../api/ratings/ratings';

class EmployerLanding extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jobs: [],
      skills: [],
      jobModalOpen: false,
      openedJob: null,
      hireModalOpen: false,
      skillSearchQuery: '',
      categorySearchQuery: '',
      formSuccess: false,
      formError: false,
      newJob: {
        title: '',
        description: '',
        location: '',
        pay: '',
        categoryId: null,
        skills: [],
      },
      feedbackModalOpen: false,
      selectedJob: {},
      userToRate: '',
      ratingValue: -1,
    };
    this.openJobModal = this.openJobModal.bind(this);
    this.closeJobModal = this.closeJobModal.bind(this);
    this.openHireModal = this.openHireModal.bind(this);
    this.closeHireModal = this.closeHireModal.bind(this);
    this.clearNewJob = this.clearNewJob.bind(this);
    this.handleFormChanges = this.handleFormChanges.bind(this);
    this.validateJob = this.validateJob.bind(this);
    this.submitJob = this.submitJob.bind(this);
    this.openFeedbackModal = this.openFeedbackModal.bind(this);
    this.closeFeedbackModal = this.closeFeedbackModal.bind(this);
    this.submitRating = this.submitRating.bind(this);
    this.handleRatingChange = this.handleRatingChange.bind(this);
    this.handleSuccessEmployeeHire = this.handleSuccessEmployeeHire.bind(this);
    this.handleInviteHelper = this.handleInviteHelper.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.jobs.length !== 0 &&
        nextProps.skills.length !== 0 &&
        nextProps.categories.length !== 0
    ) {
      const jobs = nextProps.jobs;
      const skills = nextProps.skills;
      this.setState({
        jobs,
        skills,
      });
    }
  }

  componentWillMount() {
    this.setState({
      jobs: this.props.jobs,
    });
  }

  openJobModal() {
    this.setState({
      jobModalOpen: true,
    });
  }

  closeJobModal() {
    this.setState({
      jobModalOpen: false,
    });
  }

  openHireModal = (job) => {
    this.setState({
      openedJob: job,
      hireModalOpen: true,
    });
  };

  closeHireModal() {
    this.setState({
      hireModalOpen: false,
    });
  }

  handleFormChanges = (e, { name, value }) => {
    this.setState({ formError: false });
    const newJob = this.state.newJob;
    if (name === 'pay') {
      newJob[name] = parseFloat(value);
    } else {
      newJob[name] = value;
    }
    this.setState({
      newJob,
    });
  };

  submitJob() {
    const { newJob } = this.state;
    const valid = this.validateJob();
    if (valid) {
      newJob.postDate = new Date();
      newJob.open = 1;
      newJob.employerId = Meteor.user().username;
      Jobs.insert(this.state.newJob, (jobErr, id) => {
        if (jobErr) {
          this.setState({
            formError: true,
          });
        } else {
          JobApplicants.insert({ jobId: id, applicantIds: [] }, (JobApplicantErr) => {
            if (JobApplicantErr) {
              this.setState({
                formError: true,
              });
            } else {
              this.setState({
                formSuccess: true,
                newJob: {
                  title: '',
                  description: '',
                  location: '',
                  pay: '',
                  categoryId: null,
                  skills: [],
                },
                jobModalOpen: false,
              });
              Bert.alert('Successfully Posted Job', 'success', 'growl-top-right');
            }
          });
        }
      });
    } else {
      this.setState({
        formError: true,
      });
    }
  }

  handleSuccessEmployeeHire(employee, job) {
    this.closeHireModal();
    Bert.alert(`Successfully Hired ${employee.firstName} to job ${job.title}`, 'success', 'growl-top-right');
  }

  validateJob() {
    const { newJob } = this.state;
    let valid = true;
    _.forOwn(newJob, (value) => {
      if (value === null || value === '' || value === []) {
        valid = false;
      }
    });
    return valid;
  }

  clearNewJob() {
    this.setState({
      newJob: {
        title: '',
        description: '',
        location: '',
        pay: '',
        categoryId: null,
        skills: [],
      },
    });
  }

  openFeedbackModal(job) {
    const uname = Meteor.user().username;
    if (uname === job.employerId || uname === job.employeeId) {
      this.setState({
        feedbackModalOpen: true,
        selectedJob: job,
        userToRate: uname === job.employerId ? job.employeeId : job.employerId,
      });
    }
  }

  closeFeedbackModal() {
    this.setState({
      feedbackModalOpen: false,
      selectedJob: {},
      userToRate: '',
      ratingValue: -1,
    });
  }

  handleRatingChange(e, { value }) {
    this.setState({
      ratingValue: value,
    });
  }

  submitRating() {
    const { userToRate, ratingValue, selectedJob } = this.state;
    Ratings.insert({
      rating: ratingValue,
      user: userToRate,
    }, (err, result) => {
        if (result !== null && err === null) {
          Jobs.update(
              {
                _id: selectedJob._id,
              },
              {
                $set: { open: -1, employerSubmitRating: true },
              },
              (jobUpdateErr) => {
                if (err) {
                  console.log(jobUpdateErr);
                } else {
                  console.log('Success!');
                  this.closeFeedbackModal();
                  Bert.alert(`Successfully Submitted review for  ${userToRate}`, 'success', 'growl-top-right');
                }
              },
          );
        } else {
          console.log(err);
          Bert.alert('Failed to submit review', 'danger', 'growl-top-right');
          this.closeFeedbackModal();
        }
    });
  }

  handleInviteHelper(jobID, helper) {
    // updates on the client side need the _id of the document to be updated
    // jobId is not sufficient and results in an untrusted 403 error
    const applicantDoc = JobApplicants.findOne({ jobId: jobID });

    JobApplicants.update(
        {
          _id: applicantDoc._id,
        },
        {
          $addToSet: { applicantIds: helper.username },
        },
        (err, success) => {
          if (err === null && success !== null) {
            Bert.alert(`Successfully invited helper ${helper.username}`, 'success', 'growl-top-right');
          }
          else {
            Bert.alert('Failed to invite helper', 'danger', 'growl-top-right');
          }
        },
    );
    this.setState(this.state); // forces a re-render of the page to show the updated job card state
  }

  renderPage() {
    const { skills, categories, jobs } = this.props;

    const {
      jobModalOpen, newJob, skillSearchQuery,
      formError, categorySearchQuery, feedbackModalOpen, userToRate, ratingValue,
      hireModalOpen, openedJob } = this.state;
    const pastHelperNames = jobs.filter((job) => job.open === 2).map((job) => job.employeeId);
    const pastHelpers = pastHelperNames.map((name) => Meteor.users.findOne({ username: name }));
    const filteredHelpers = _.uniqWith(pastHelpers, _.isEqual);
    return (
      <div style={{ backgroundColor: 'ghostwhite' }}>
        <Container style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
          <Grid columns={2}>
            <Grid.Column>
              <h1>Your Jobs</h1>
            </Grid.Column>
            <Grid.Column textAlign='right'>
              <Button primary onClick={this.openJobModal}>Create New Job</Button>
            </Grid.Column>
          </Grid>
          <Divider/>
          <Grid>
            <Grid.Row>
              <Card.Group>
                {
                  jobs.map((job) => <EmployerJobCard key={job._id} job={job}
                      skills={skills}
                      openHireModal={() => this.openHireModal(job)}
                      feedBackModal={() => this.openFeedbackModal(job)}/>)
                }
              </Card.Group>
            </Grid.Row>
          </Grid>

          <h1>Your Past Helpers</h1>
          <Divider/>
          <Grid>
            <Grid.Row>
              <Card.Group>
                {
                  filteredHelpers.map((helper, index) =>
                      <EmployeeCard key={index} employee={helper}
                                    ratings={this.props.ratings.filter((rating) => rating.user === helper.username)}
                                    skills={skills} jobs={jobs}
                                    inviteHelperCallback={this.handleInviteHelper} cardType='feedback'/>)
                }
              </Card.Group>
            </Grid.Row>
          </Grid>
        </Container>
        <FeedbackModal closeCallback={this.closeFeedbackModal} isOpen={feedbackModalOpen}
                       ratedUser={userToRate} ratingChangeCallback={this.handleRatingChange}
                       submitCallback={this.submitRating} ratingValue={ratingValue}/>
        <NewJobModal newJob={newJob} formError={formError}
                              skillSearchQuery={skillSearchQuery}
                              skills={skills} categorySearchQuery={categorySearchQuery}
                              categories={categories} jobModalOpen={jobModalOpen}
                              closeJobModal={this.closeJobModal} submitJob={this.submitJob}
                              clearNewJob={this.clearNewJob} handleFormChanges={this.handleFormChanges}/>
        <HireHelperModal closeHireModal={this.closeHireModal} skills={skills}
                         job={openedJob} hireModalOpen={hireModalOpen} ratings={this.props.ratings}
                         handleSuccessHire={this.handleSuccessEmployeeHire}/>
      </div>
    );
  }

  render() {
    return (this.props.ready) ? this.renderPage() : <Loader>Retrieving Jobs</Loader>;
  }
}

EmployerLanding.propTypes = {
  jobs: PropTypes.array.isRequired,
  skills: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
  ready: PropTypes.bool.isRequired,
  ratings: PropTypes.array.isRequired,
};

export default withTracker(() => {
  const jobSubscription = Meteor.subscribe('UserJobs');
  const skillSubscription = Meteor.subscribe('SkillsString');
  const categorySubscription = Meteor.subscribe('CategoriesString');
  const jobApplicantsSubscription = Meteor.subscribe('JobApplicants');
  const userProfileSubscription = Meteor.subscribe('UserProfiles');
  const ratingsSubscription = Meteor.subscribe('AllRatings');
  return {
    ready: jobSubscription.ready() && skillSubscription.ready() &&
          categorySubscription.ready() && jobApplicantsSubscription.ready() &&
    userProfileSubscription.ready() && ratingsSubscription.ready(),
    jobs: Jobs.find({}).fetch(),
    skills: Skills.find({}).map((skill) => ({
      key: skill._id,
      text: skill.name,
      value: skill._id,
    })),
    categories: Categories.find({}).map((cat) => ({
      key: cat._id,
      text: cat.title,
      value: cat._id,
    })),
    ratings: Ratings.find({}).fetch(),
  };
})(EmployerLanding);
