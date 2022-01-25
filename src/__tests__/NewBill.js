import { screen, fireEvent  } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES } from "../constants/routes";
import store from "../app/Store"
import storeMock from '../__mocks__/store';
import BillsUI from "../views/BillsUI.js";

//Create an user for the tests
window.localStorage.setItem(
  'user',
  JSON.stringify({
      type: 'Employee',
  })
);
// Init onNavigate
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({
    pathname
  });
};


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then ...", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
    })
  })

  describe('When I choose an image to upload', () => {
    test('Then the file input should get the file name', () => {
        // build user interface
        const html = NewBillUI();
        document.body.innerHTML = html;

        // Init newBill
        const newBill = new NewBill({
            document,
            onNavigate,
            store: store,
            localStorage: window.localStorage
        });

        // Mock function handleChangeFile
        const handleChangeFile = jest.fn(() => newBill.handleChangeFile);

        // Add Event and fire
        const inputFile = screen.getByTestId('file');
        inputFile.addEventListener('change', handleChangeFile);

        // Launch event
        fireEvent.change(inputFile, {
            target: {
              files: [new File(["src/assets/images/facturefreemobile.jpg"], "facturefreemobile.jpg", { type: "image/jpeg" })],
            }
        });

        // handleChangeFile function must be called
        expect(handleChangeFile).toBeCalled();
        const fileCount = screen.getByTestId("file").files.length
        expect(fileCount).toEqual(1)
    });
  });

  describe('When I choose something else than an image to upload', () => {
    test('Then the file input should get the file name', () => {
        // build user interface
        const html = NewBillUI();
        const consoleSpy = jest.spyOn(console, 'log');
        document.body.innerHTML = html;

        // Init newBill
        const newBill = new NewBill({
            document,
            onNavigate,
            store: store,
            localStorage: window.localStorage
        });

        // Mock function handleChangeFile
        const handleChangeFile = jest.fn(() => newBill.handleChangeFile);

        // Add Event and fire
        const inputFile = screen.getByTestId('file');
        inputFile.addEventListener('change', handleChangeFile);

        // Launch event
        fireEvent.change(inputFile, {
          target: {
            files: [new File(['text.txt'], 'text.txt', { type: 'texte/txt'})],
          }
        });

        // handleChangeFile function must be called
        expect(handleChangeFile).toBeCalled();
        const fileCount = screen.getByTestId("file").files.length
        expect(fileCount).toEqual(1)
        expect(consoleSpy).toHaveBeenCalledWith('error');

    });
  });

  describe('When I submit the form with an image (jpg, jpeg, png)', () => {
    test('Then it should create a new bill', () => {
        // Init store
        const store = null;

        // Build user interface
        const html = NewBillUI();
        document.body.innerHTML = html;

        // Init newBill
        const newBill = new NewBill({
            document,
            onNavigate,
            store,
            localStorage: window.localStorage,
        });

        // mock of handleSubmit
        const handleSubmit = jest.fn(newBill.handleSubmit);

        // EventListener to submit the form
        const submitBtn = screen.getByTestId('form-new-bill');
        submitBtn.addEventListener('submit', handleSubmit);
        fireEvent.submit(submitBtn);

        // handleSubmit function must be called
        expect(handleSubmit).toHaveBeenCalled();
    });
  });
})

// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I create a new bill", () => {
    test("Add bill with mock API POST", async () => {
        // Init newBill for test
        const newBill = {
          id: "47qAXb6fIm2zOKkLzMro",
          vat: "80",
          fileUrl: "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
          status: "pending",
          type: "Hôtel et logement",
          commentary: "séminaire billed",
          name: "encore",
          fileName: "preview-facture-free-201801-pdf-1.jpg",
          date: "2004-04-04",
          amount: 400,
          commentAdmin: "ok",
          email: "a@a",
          pct: 20
        };
       const postSpy = jest.spyOn(storeMock, "post")
       const bills = await storeMock.post(newBill);
       expect(postSpy).toHaveBeenCalledTimes(1)
       expect(bills.data.length).toBe(5)
    })
    test("Add bill with mock API POST and fails with 404 message error", async () => {
      storeMock.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("Add bill with mock API POST and fails with 500 message error", async () => {
      storeMock.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})