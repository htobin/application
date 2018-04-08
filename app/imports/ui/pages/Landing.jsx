import React from 'react';
import { Grid, Input, Container, List, Divider, Button } from 'semantic-ui-react';
import JobSearchResult from './JobSearchResult';
import PropTypes from 'prop-types';

const videoDivStyle = {
  width: '100%',
  position: 'relative',
};

const videoBlock = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const contentBlock = {
  position: 'absolute',
  top: '25%',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const topColumnStyle = {
  paddingTop: '0',
};

/** A simple static component to render some text for the landing page. */
class Landing extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
    };
    this.handleSearch = this.handleSearch.bind(this);
    this.handleSearchText = this.handleSearchText.bind(this);
  }

  handleSearch() {
    const { history } = this.props;
    history.push(`job-search-results?title=${this.state.searchText}`);
  }

  handleSearchText(e, data) {
    this.setState({
      searchText: data.value,
    });
  }

  render() {
    return <div>
      <div>
        <Grid centered verticalAlign='middle' textAlign='center'>
          <Grid.Row centered style={topColumnStyle}>
            <Grid.Column centered>
              <div style={videoDivStyle}>
                <div style={videoBlock}>
                  <video style={{ filter: 'grayscale(100%)' }} autoPlay loop width='100%'>
                    <source src="/videos/student_teacher.mp4" type='video/mp4'></source>
                    <source src="/videos/student_teacher.webm" type='video/mp4'></source>
                  </video>
                </div>
                <div style={contentBlock}>
                  <Input style={{ width: '800px' }} size={'massive'}
                          placeholder="Search job title" action
                          onChange={(e, data) => this.handleSearchText(e, data)}>
                    <input/>
                    <Button color={'black'} size={'massive'} type={'submit'} onClick={this.handleSearch}>Search</Button>
                  </Input>
                </div>
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
      <Container>
        <Grid centered verticalAlign='middle' textAlign='center'>
          <Grid.Row>
            <h1>Small Kine Jobs turns big problems in to "small kine" ones</h1>
          </Grid.Row>
          <Divider/>
          <Grid.Row>
            <Grid.Column width={4}>
            </Grid.Column>
            <Grid.Column width={4}>
              <img src='/images/landingPage/profiles.png' floated='right'/>
            </Grid.Column>
            <Grid.Column width={8}>
              <List>
                <List.Item>
                  <h1>Step 1</h1>
                </List.Item>
                <List.Item>
                  <h2>Create your profile</h2>
                </List.Item>
                <List.Item>
                  <h3>
                    Create your profile. If you're looking for employees just add your basic info. If you're
                    looking for a small kine job, list your skills so that way we can help you find the perfect job
                    for you.
                  </h3>
                </List.Item>
              </List>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <br/>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column textAlign={'right'} width={8}>
              <List>
                <List.Item>
                  <h1>Step 2</h1>
                </List.Item>
                <List.Item>
                  <h2>Small kine search or small kine post</h2>
                </List.Item>
                <List.Item>
                  <h3>
                    Once you have your profile created employers can post up jobs that they need help where
                    employees can apply for that job. Employees will have 'recommended jobs' depending on the skills
                    listed on your profile, you can also search for other jobs if you want to see more.
                  </h3>
                </List.Item>
              </List>
            </Grid.Column>
            <Grid.Column width={8}>
              <img src='/images/landingPage/choose.png'/>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <br/>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={4}>
            </Grid.Column>
            <Grid.Column width={4}>
              <img width='60%' src='/images/landingPage/shaka.jpg'/>
            </Grid.Column>
            <Grid.Column width={8}>
              <List>
                <List.Item>
                  <h1>Step 3</h1>
                </List.Item>
                <List.Item>
                  <h2>Apply and cruise 'um</h2>
                </List.Item>
                <List.Item>
                  <h3>Once you have posted a job and/or applied for a job sit back and relax.</h3>
                </List.Item>
              </List>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Divider/>
        <Grid centered verticalAlign='middle' textAlign='center'>
          <Grid.Row>
            <h1>What is 'Small Kine Jobs'?</h1>
          </Grid.Row>
          <Divider/>
          <Grid.Row>
            <h2>
              Small Kine Jobs is an app that allows students and faculty of UH Manoa to find or post a job that
              doesn't require a long time commitment. These small tasks can range from office work, to yard
              maintenence, or other small tasks where you could use an exta hand. This also offers a platform for
              those who are seeking assistance with these tasks, to find help as quickly as possible. We hope that
              Small Kine Jobs can fulfill the Hawaiian value of "Laulima" or cooperation. Where we can have
              employees who are willing to help employers and employers offer the opportunity for employees to
              showcase their skills.
            </h2>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={4}>
              <img fluid width='60%' src='/images/landingPage/babysitting.jpg'/>
            </Grid.Column>
            <Grid.Column width={4}>
              <img fluid width='60%' src='/images/landingPage/scanner.jpg'/>
            </Grid.Column>
            <Grid.Column width={4}>
              <img fluid width='60%' src='/images/landingPage/tutoring.jpg'/>
            </Grid.Column>
            <Grid.Column width={4}>
              <img fluid width='60%' src='/images/landingPage/yardwork.jpg'/>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <h1>
              ‘A‘ohe hana nui ke alu ‘ia.
              No task is too big when done together by all.
            </h1>
          </Grid.Row>
        </Grid>
      </Container>
    </div>;
  }
}
Landing.propTypes = {
  history: PropTypes.any,
};

export default Landing;
