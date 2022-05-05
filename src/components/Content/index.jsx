import React, { useState, useEffect } from 'react';
import { Button, Table } from 'react-bootstrap';
import api from '../../services/api';

import { FaTrashAlt, FaCog } from "react-icons/fa";

import { CommForm } from '../CommForm';

import './styles.css';


export function Content(){
  const [communications, setCommunications ] = useState()
  const [commId, setCommId] = useState(null)
  const [show, setShow] = useState(false);
  const [value, setValue] = useState('')

  const handleClose = () => setShow(false);

  useEffect(() => {
    loadData()
  }, [])

  function loadData() {
    async function fetchCommunications() {
      const response = await api.get('/loss_communication')
      setCommunications(response.data.items)
    }
    fetchCommunications();
  }

  function handeCreateLossCommunication(){
    setCommId(null)
    setShow(true)
  }

  function handleEditLossCommunication(id){
    setCommId(id)
    setShow(true)
  }

  async function handleDeleteCommunicationLoss(id) {
    if (window.confirm('Tem certeza que deseja remover essa comunicação de perda?')) {
      await api.delete(`/loss_communication/${id}`)
      const newLossCummunicationsData = communications.filter(comm => comm.id !== id)
      setCommunications(newLossCummunicationsData)
    }
  }

  return (
    <div className="container">

      <div style={{ display: 'flex', flexDirection: 'row', margin: '40px 0', justifyContent: 'flex-end' }}>
        <input type="text" placeholder="Pesquisar..." style={{borderRadius: '5px', padding: '5px', width: '300px'}} value={value} onChange={e => setValue(e.target.value)}/>

        <div style={{ border: '1px solid #3c3c3c', margin: '0 5px'}} />

        <Button variant="primary" onClick={() => handeCreateLossCommunication()}>Nova comunicação</Button>
      </div>

      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>CPF</th>
            <th>Produto</th>
            <th>Causalidade</th>
            <th>Data</th>
            <th width="105px"></th>
          </tr>
        </thead>

        <tbody>
            {communications && communications.filter(item => {
              if (!value) return true
              if (item.cpf.startsWith(value)) {
                return true
              }
            }).map(comm => (
              <tr key={comm.id}>
                <td>{comm.name}</td>
                <td>{comm.cpf}</td>
                <td style={{ textTransform: 'capitalize'}}>{comm.type_farming}</td>
                <td>{comm.event}</td>
                <td>{comm.date}</td>
                <td>
                  <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                  <Button variant="success" onClick={() => handleEditLossCommunication(comm.id)}>
                    <FaCog size="16px"/>
                  </Button>
                  <Button variant="danger" onClick={() => handleDeleteCommunicationLoss(comm.id)}>
                    <FaTrashAlt size="16px" />
                  </Button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>

      <CommForm
        show={show}
        onClose={handleClose}
        communications={communications}
        commId={commId}
        loadData={loadData}
      />

    </div>
  );
}