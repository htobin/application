import React from 'react';
import { Container, Grid, Divider, Card, Loader } from 'semantic-ui-react';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import JobSearchCard from './JobSearchCard';
import { Jobs } from '../../api/jobs/jobs';
import EmployeeJobCard from './EmployeeJobCard';
import { Skills } from '../../api/skills/skills';
import FeedbackModal from './FeedbackModal';
import JobDetailModal from './JobDetailModal';
import { Ratings } from '../../api/ratings/ratings';
import { JobApplicants } from '../../api/jobApplicants/jobApplicants';
import { _ } from 'lodash';

class EmployeeLanding extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userToRate: '',
      ratingValue: -1,
      feedbackModalOpen: false,
      modalOpen: false,
      selectedJob: {
        skills: [],
      },
    };
    this.openFeedbackModal = this.openFeedbackModal.bind(this);
    this.closeFeedbackModal = this.closeFeedbackModal.bind(this);
    this.submitRating = this.submitRating.bind(this);
    this.handleRatingChange = this.handleRatingChange.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.completeJob = this.completeJob.bind(this);
    this.handleApply = this.handleApply.bind(this);
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
      selectedJob: { skills: [] },
      userToRate: '',
      ratingValue: -1,
    });
  }

  openModal(job) {
    this.setState({
      modalOpen: true,
      selectedJob: job,
    });
  }

  closeModal() {
    this.setState({
      modalOpen: false,
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
              $set: { open: -1, employeeSubmitRating: true },
            },
            (jobUpdateErr) => {
              if (jobUpdateErr) {
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

  completeJob(job) {
    this.setState({
      selectedJob: job,
    });
    Jobs.update(
        {
          _id: job._id,
        },
        {
          $set: { open: 2 },
        },
        (jobCompleteErr) => {
          if (jobCompleteErr) {
            console.log(jobCompleteErr);
          } else {
            Bert.alert(`Successfully completed job ${job.title}`, 'success', 'growl-top-right');
          }
        },
        );

  }

  handleApply() {
    const { selectedJob } = this.state;
    const jobApplicantDataObject = JobApplicants.findOne({ jobId: selectedJob._id });
    JobApplicants.update(
        {
          _id: jobApplicantDataObject._id,
        },
        {
          $push: { applicantIds: Meteor.user().username },
        },
        (err) => {
          if (err) {
            console.log(err);
          } else {
            this.setState({
              selectedJob: { skills: [] },
            });
            this.closeModal();
            Bert.alert(`Successfully Applied to ${selectedJob.title}`, 'success', 'growl-top-right');
          }
        },
    );
  }

  renderPage() {
    const { userToRate, ratingValue, feedbackModalOpen, selectedJob, modalOpen } = this.state;
    const { skills, jobApplicants } = this.props;
    const jobs = Jobs.find({}).fetch();
    const jobsApplied = _.filter(jobs, (job) => {
      const jobIdsWithUser = _.map(_.filter(jobApplicants, (ja) => {
        return _.includes(ja.applicantIds, Meteor.user().username);
      }), 'jobId');
      return _.includes(jobIdsWithUser, job._id);
    });
    const jobsOpen = _.filter(jobs, (job) => {
      const jobIdsWithOutUser = _.map(_.filter(jobApplicants, (ja) => {
        return !_.includes(ja.applicantIds, Meteor.user().username);
      }), 'jobId');
      return _.includes(jobIdsWithOutUser, job._id) && job.open === 1;
    });
    return (
      <div style={{ backgroundColor: 'ghostwhite' }}>
        <Container style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
          <h1>Jobs Applied For</h1>
          <Divider/>
          <Grid>
            <Grid.Row>
              <Card.Group>
                {
                  jobsApplied.map((job) => <EmployeeJobCard key={job._id} job={job} skills={skills}
                                                     feedBackModal={() => this.openFeedbackModal(job)}
                                                     completeJobCallback={() => this.completeJob(job)}/>)
                }
              </Card.Group>
            </Grid.Row>
          </Grid>

          <h1>Other Recommended Jobs</h1>
          <Divider/>
          <Grid>
            <Grid.Row>
              <Card.Group>
                {
                  jobsOpen.map((job) => <JobSearchCard key={job._id} job={job} skills={skills}
                                                   jobApplicants={jobApplicants} openModal={this.openModal}/>)
                }
              </Card.Group>
            </Grid.Row>
          </Grid>
        </Container>
        <FeedbackModal closeCallback={this.closeFeedbackModal} isOpen={feedbackModalOpen}
                       ratedUser={userToRate} ratingChangeCallback={this.handleRatingChange}
                       submitCallback={this.submitRating} ratingValue={ratingValue}/>
        <JobDetailModal selectedJob={selectedJob} modalOpen={modalOpen}
                        jobApplicants={_.find(jobApplicants, (ja) => {
                          return ja.jobId === selectedJob._id;
                        })}
                        skills={this.props.skills} closeModal={this.closeModal}
                        clearSelectedJob={this.clearSelectedJob} handleApply={this.handleApply} />
      </div>
    );
  }

  render() {
    return (this.props.ready) ? this.renderPage() : <Loader>Retrieving Jobs</Loader>;
  }
}

EmployeeLanding.propTypes = {
  ready: PropTypes.bool.isRequired,
  skills: PropTypes.array,
  jobApplicants: PropTypes.array.isRequired,
};

export default withTracker(() => {
  const userJobSubscription = Meteor.subscribe('UserJobs');
  const openJobSubscription = Meteor.subscribe('SearchedJobs');
  const skillSubscription = Meteor.subscribe('SkillsString');
  const ApplicantsSubscription = Meteor.subscribe('JobApplicants');
  return {
    ready: userJobSubscription.ready() && skillSubscription.ready() && openJobSubscription.ready() &&
    ApplicantsSubscription.ready(),
    skills: Skills.find({}).map((skill) => ({
      key: skill._id,
      text: skill.name,
      value: skill._id,
    })),
    jobApplicants: JobApplicants.find({}).fetch(),
  };
})(EmployeeLanding);
