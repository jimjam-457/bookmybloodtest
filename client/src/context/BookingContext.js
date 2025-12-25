import React, { createContext, useContext, useReducer } from 'react';

const BookingContext = createContext();

function reducer(state, action) {
  switch(action.type) {
    case 'ADD_TEST': {
      if (state.items.find(i=>i.id===action.test.id)) return state;
      return { ...state, items: [...state.items, action.test] };
    }
    case 'REMOVE_TEST':
      return { ...state, items: state.items.filter(i=>i.id!==action.id) };
    case 'SET_PATIENT':
      return { ...state, patient: action.patient };
    case 'SET_ADDRESS':
      return { ...state, address: action.address };
    case 'SET_PAYMENT':
      return { ...state, payment: action.payment };
    case 'CLEAR':
      return { ...state, items: [], patient: null, address: null, payment: null };
    default:
      return state;
  }
}

export function BookingProvider({ children }) {
  const initial = { items: [], patient: null, address: null, payment: null };
  const [state, dispatch] = useReducer(reducer, initial);
  const addTest = (test) => dispatch({ type: 'ADD_TEST', test });
  const removeTest = (id) => dispatch({ type: 'REMOVE_TEST', id });
  const setPatient = (patient) => dispatch({ type: 'SET_PATIENT', patient });
  const setAddress = (address) => dispatch({ type: 'SET_ADDRESS', address });
  const setPayment = (payment) => dispatch({ type: 'SET_PAYMENT', payment });
  const clear = () => dispatch({ type: 'CLEAR' });
  return (
    <BookingContext.Provider value={{ items: state.items, patient: state.patient, address: state.address, payment: state.payment, addTest, removeTest, setPatient, setAddress, setPayment, clear }}>
      {children}
    </BookingContext.Provider>
  );
}

export const useBooking = () => useContext(BookingContext);
