import { TransitionLink } from '~/transition-link';
import BottomSheet from '~/bottom-sheet/bottom-sheet';
import { useState } from 'react';

export const clientLoader = () => {
  // await new Promise((resolve) => setTimeout(resolve, 600));
  return {};
};

const Step1BottomSheetWrapper = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`bg-blue-500 text-white p-2 rounded block m-2`}
      >
        Open Bottom Sheet
      </button>
      <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="p-4">
          <h2 className="text-2xl">Bottom Sheet</h2>
          <p className="text-gray-500">This is a bottom sheet</p>
          <p className="text-gray-500">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed
            diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum
            dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et
            justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
            
            </p>
          <button
            onClick={() => setIsOpen(false)}
            className={`bg-blue-700 text-white p-2 rounded`}
          >
            close
          </button>
        </div>
      </BottomSheet>
    </>
  );
}

const Step1ShortBottomSheetWrapper = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`bg-blue-500 text-white p-2 rounded block m-2`}
      >
        Open Short Bottom Sheet
      </button>
      <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="p-4">
          <h2 className="text-2xl">Bottom Sheet</h2>
          <p className="text-gray-500">This is a bottom sheet</p>
          <p className="text-gray-500">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed           
            </p>
          <button
            onClick={() => setIsOpen(false)}
            className={`bg-blue-700 text-white p-2 rounded`}
          >
            close
          </button>
        </div>
      </BottomSheet>
    </>
  );
}

const Step1InputBottomSheetWrapper = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`bg-blue-500 text-white p-2 rounded block m-2`}
      >
        Open Input Bottom Sheet
      </button>
      <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="p-4">
          <h2 className="text-2xl">Bottom Sheet</h2>
          <form action="#" onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.target as HTMLFormElement);
            alert(`first-input: ${formData.get('top-input')} second-input: ${formData.get('bottom-input')}`);
          }}>
            <input name="top-input" type="text" className="border-2 border-gray-300 rounded-md p-2" placeholder="top input" />
            <p className="text-gray-500">This is a bottom sheet</p>
            <p className="text-gray-500">
            diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum
              dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et
              justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
            </p>
            <input name="bottom-input" type="text" className="border-2 border-gray-300 rounded-md p-2" placeholder="bottom input" />
            <button type="submit" className="bg-blue-700 text-white p-2 rounded">Submit</button>
          </form>
          <button
            onClick={() => setIsOpen(false)}
            className={`bg-blue-700 text-white p-2 rounded`}
          >
            close
          </button>
        </div>
      </BottomSheet>
    </>
  );
}

export default function Step1() {

  return (
    <main>
      <h1 className="text-4xl">Step 1</h1>
      <ul className="p-2 gap-2 flex flex-col">
        {Array.from({ length: 30 }).map((_, i) => {
          if (i === 2) {
            return (
              <li key={i}>
                <Step1BottomSheetWrapper />
                <Step1ShortBottomSheetWrapper />
                <Step1InputBottomSheetWrapper />
              </li>
            )
          }
          if (i === 6) {
            return (
              <li key={i} className="h-64 bg-gray-400 odd:bg-gray-300 rounded block">
                <TransitionLink
                  to="/"
                  viewTransitionName="page-default-backward"
                  viewTransition
                  className="size-full flex justify-center items-center text-7xl"
                >
                  <span className="text-lg text-gray-500">zurück zu </span>
                  Home
                  <span className="text-lg text-gray-500">{i + 1}</span>
                </TransitionLink>
              </li>
            );
          }

          return (
            <li key={i} className="h-64 bg-gray-400 odd:bg-gray-300 rounded block">
              <TransitionLink
                to="/step2"
                viewTransitionName="page-default-forward"
                viewTransition
                className="size-full flex justify-center items-center text-7xl"
              >
                2
                <span className="text-lg text-gray-500">{i + 1}</span>
              </TransitionLink>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
