import React, { Component } from "react";

import Navbar from "../../Navbar/Navigation";
import NavbarAdmin from "../../Navbar/NavigationAdmin";

import getWeb3 from "../../../getWeb3";
import Election from "../../../contracts/Election.json";

import AdminOnly from "../../AdminOnly";

import "./AddCandidate.css";

const options = ["I will attend", "I will not attend"];

export default class AddCandidate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ElectionInstance: undefined,
      web3: null,
      account: null,
      isAdmin: false,
      choice: "",
      candidates: [],
      candidateCount: undefined,
      elDetails: {}
    };
  }

  componentDidMount = async () => {
    // refreshing page only once
    if (!window.location.hash) {
      window.location = window.location + "#loaded";
      window.location.reload();
    }

    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Election.networks[networkId];
      const instance = new web3.eth.Contract(
        Election.abi,
        deployedNetwork && deployedNetwork.address
      );
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.state.web3 = web3;
      this.state.ElectionInstance = instance;
      this.state.account = accounts[0];

      // Total number of candidates
      const candidateCount = await this.state.ElectionInstance.methods
        .getTotalCandidate()
        .call();
      this.setState({ candidateCount: Number(candidateCount) });

      // Getting election details from the contract
      const electionDetails = await this.state.ElectionInstance.methods
      .getElectionDetails()
      .call();
      this.state.elDetails = electionDetails;

      const admin = await this.state.ElectionInstance.methods.getAdmin().call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }

      // Loading Candidates details
      for (let index = 0; index < this.state.candidateCount; index++) {
        const candidate = await this.state.ElectionInstance.methods
          .candidateDetails(index)
          .call();

        this.state.candidates.push({
          id: Number(candidate.candidateId),
          choice: candidate.choice,
        });
      }

      this.setState({ candidates: this.state.candidates });
    } catch (error) {
      // Catch any errors for any of the above operations.
      console.error(error);
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
    }
  };

  updateChoice = (event) => {
    this.setState({ choice: event.target.value });
  };

  addCandidate = async () => {
    await this.state.ElectionInstance.methods
      .addCandidate(this.state.choice)
      .send({ from: this.state.account, gas: 1000000 });
    window.location.reload();
  };

  render() {
    if (!this.state.web3) {
      return (
        <>
          {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
          <center>Loading Web3, accounts, and contract...</center>
        </>
      );
    }
    if (!this.state.isAdmin) {
      return (
        <>
          <Navbar />
          <AdminOnly page="Add Candidate Page." />
        </>
      );
    }
    return (
      <>
        <NavbarAdmin />
        <div className="container-main">
          <h2 className="title">{this.state.elDetails.electionTitle}</h2>
          <div className="container-item">
            <form className="form">
              
              {options.map((option, index) => (
              <div key={index}>
                <input
                  type="radio"
                  id={option}
                  name="dynamicRadio"
                  value={option}
                  checked={this.state.choice === option}
                  onChange={this.updateChoice}
                />
                <label htmlFor={option}>{option}</label>
              </div>
              ))}
              
              <button
                className="btn-add"
                onClick={this.addCandidate}
              >
                Add
              </button>
            </form>
          </div>
        </div>
        {loadAdded(this.state.candidates)}
      </>
    );
  }
}
export function loadAdded(candidates) {
  const renderAdded = (candidate) => {
    return (
      <>
        <div className="container-list success">
          <div
            style={{
              maxHeight: "21px",
              overflow: "auto",
            }}
          >
            {candidate.id}. <strong>{candidate.choice}</strong>:{" "}
          </div>
        </div>
      </>
    );
  };
  return (
    <div className="container-main" style={{ borderTop: "1px solid" }}>
      <div className="container-item info">
        <center>Poll Options</center>
      </div>
      {candidates.length < 1 ? (
        <div className="container-item alert">
          <center>No options added.</center>
        </div>
      ) : (
        <div
          className="container-item"
          style={{
            display: "block",
            backgroundColor: "#DDFFFF",
          }}
        >
          {candidates.map(renderAdded)}
        </div>
      )}
    </div>
  );
}
