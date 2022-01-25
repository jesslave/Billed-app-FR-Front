import { screen, fireEvent } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from '../containers/Bills';
import { ROUTES } from "../constants/routes";
import store from "../__mocks__/store"

// Init onNavigate
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({
    pathname
  });
};

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: []})
      document.body.innerHTML = html
      //to-do write expect expression
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  describe("When there is an error", () => {
    test("Then, display the error", () => {
      const html = BillsUI({ error: 'there is an error' })
      document.body.innerHTML = html
      
      expect(screen.getAllByText('Erreur')).toBeTruthy();
    })
  })

  describe('When I am on Bills page but it is loading', () => {
    test('Then, Loading page should be rendered', () => {
      const html = BillsUI({ loading: true })
      document.body.innerHTML = html
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })

   // handleClickIconEye for container/Bills.js
   describe('When I click on the icon eye', () => {
    test('A modal should open', () => {
      // build user interface
      const html = BillsUI({
        data: bills
      });
      document.body.innerHTML = html;

      // Init store
      const store = null;
      // Init Bills
      const allBills = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      // Mock modal comportment
      $.fn.modal = jest.fn();

      // Get button eye in DOM
      const eye = screen.getAllByTestId('icon-eye')[0];

      // Mock function handleClickIconEye
      const handleClickIconEye = jest.fn(() =>
        allBills.handleClickIconEye(eye)
      );

      // Add Event and fire
      eye.addEventListener('click', handleClickIconEye);
      fireEvent.click(eye);

      // handleClickIconEye function must be called
      expect(handleClickIconEye).toHaveBeenCalled();
      const modale = document.getElementById('modaleFile');
      // The modal must be present
      expect(modale).toBeTruthy();
    });
  });

  // handleClickNewBill for container/Bills.js
  describe('Given I am connected as Employee and I am on Bills page', () => {
    describe('When I click on the New Bill button', () => {
      test('Then, it should render NewBill page', () => {

        // build user interface
        const html = BillsUI({
          data: []
        });
        document.body.innerHTML = html;

        // Init store
        const store = null;

        // Init Bills
        const allBills = new Bills({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });

        // Mock handleClickNewBill
        const handleClickNewBill = jest.fn(allBills.handleClickNewBill);
        // Get button eye in DOM
        const billBtn = screen.getByTestId('btn-new-bill');

        // Add event and fire
        billBtn.addEventListener('click', handleClickNewBill);
        fireEvent.click(billBtn);

        // screen should show Envoyer une note de frais
        expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy();
      });
    });
  });

  
})

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
       const getSpy = jest.spyOn(store, "get")
       const bills = await store.get()
       expect(getSpy).toHaveBeenCalledTimes(1)
       expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      store.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      store.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})