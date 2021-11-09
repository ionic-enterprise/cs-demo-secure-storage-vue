import AppTastingNoteEditor from '@/components/AppTastingNoteEditor.vue';
import useTastingNotes from '@/use/tasting-notes';
import useTeaCategories from '@/use/tea-categories';
import { modalController } from '@ionic/vue';
import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import waitForExpect from 'wait-for-expect';

jest.mock('@/use/tasting-notes');
jest.mock('@/use/tea-categories');

describe('AppTastingNoteEditor.vue', () => {
  let wrapper: VueWrapper<typeof AppTastingNoteEditor>;

  beforeEach(() => {
    const { categories } = useTeaCategories();
    categories.value = [
      {
        id: 1,
        name: 'Green',
        image: 'assets/img/green.jpg',
        description: 'Green tea description.',
        rating: 3,
      },
      {
        id: 2,
        name: 'Black',
        image: 'assets/img/black.jpg',
        description: 'Black tea description.',
        rating: 0,
      },
      {
        id: 3,
        name: 'Herbal',
        image: 'assets/img/herbal.jpg',
        description: 'Herbal Infusion description.',
        rating: 0,
      },
    ];
    wrapper = mount(AppTastingNoteEditor);
    jest.clearAllMocks();
  });

  it('renders', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('binds the teas in the select', () => {
    const select = wrapper.find('[data-testid="tea-type-select"]');
    const opts = select.findAll('ion-select-option');
    expect(opts.length).toBe(3);
    expect(opts[0].text()).toBe('Green');
    expect(opts[1].text()).toBe('Black');
    expect(opts[2].text()).toBe('Herbal');
  });

  it('displays messages as the user enters invalid data', async () => {
    const brand = wrapper.find('[data-testid="brand-input"]').findComponent({ name: 'ion-input' });
    const name = wrapper.find('[data-testid="name-input"]').findComponent({ name: 'ion-input' });
    const notes = wrapper.find('[data-testid="notes-textbox"]').findComponent({ name: 'ion-textarea' });
    const msg = wrapper.find('[data-testid="message-area"]');

    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe(''));

    await brand.setValue('foobar');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe(''));

    await brand.setValue('');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe('Brand is a required field'));

    await brand.setValue('Lipton');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe(''));

    await name.setValue('foobar');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe(''));

    await name.setValue('');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe('Name is a required field'));

    await name.setValue('Yellow Label');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe(''));

    await notes.setValue('foobar');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe(''));

    await notes.setValue('');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe(''));

    await notes.setValue('Not very good');
    await flushPromises();
    await waitForExpect(() => expect(msg.text()).toBe(''));
  });

  it('displays an appropriate title', async () => {
    const title = wrapper.find('ion-title');
    expect(title.text()).toBe('Add New Tasting Note');
    await wrapper.setProps({ noteId: 42 });
    expect(title.text()).toBe('Tasting Note');
  });

  it('populates the data when editing a note', async () => {
    const { find } = useTastingNotes();
    (find as any).mockResolvedValue({
      id: 73,
      brand: 'Rishi',
      name: 'Puer Cake',
      teaCategoryId: 6,
      rating: 5,
      notes: 'Smooth and peaty, the king of puer teas',
    });
    const modal = mount(AppTastingNoteEditor, {
      props: {
        noteId: 73,
      },
    });
    await flushPromises();
    expect(modal.vm.brand).toEqual('Rishi');
    expect(modal.vm.name).toEqual('Puer Cake');
    expect(modal.vm.teaCategoryId).toEqual(6);
    expect(modal.vm.rating).toEqual(5);
    expect(modal.vm.notes).toEqual('Smooth and peaty, the king of puer teas');
  });

  describe('submit button', () => {
    beforeEach(() => {
      modalController.dismiss = jest.fn().mockResolvedValue(undefined);
    });

    it('displays an appropriate title', async () => {
      const button = wrapper.find('[data-testid="submit-button"]');
      expect(button.text()).toBe('Add');
      await wrapper.setProps({ noteId: 42 });
      expect(button.text()).toBe('Update');
    });

    it('is disabled until valid data is entered', async () => {
      const brand = wrapper.find('[data-testid="brand-input"]').findComponent({ name: 'ion-input' });
      const name = wrapper.find('[data-testid="name-input"]').findComponent({ name: 'ion-input' });
      const teaType = wrapper.find('[data-testid="tea-type-select"]').findComponent({ name: 'ion-select' });
      const rating = wrapper.find('[data-testid="rating-input"]').findComponent({ name: 'app-rating' });
      const notes = wrapper.find('[data-testid="notes-textbox"]').findComponent({ name: 'ion-textarea' });

      const button = wrapper.find('[data-testid="submit-button"]');

      await flushPromises();
      expect(button.attributes().disabled).toBe('true');

      await brand.setValue('foobar');
      await flushPromises();
      expect(button.attributes().disabled).toBe('true');

      await name.setValue('mytea');
      await flushPromises();
      expect(button.attributes().disabled).toBe('true');

      await teaType.setValue(3);
      await flushPromises();
      expect(button.attributes().disabled).toBe('true');

      await rating.setValue(2);
      await flushPromises();
      expect(button.attributes().disabled).toBe('true');

      await notes.setValue('Meh. It is ok.');
      await flushPromises();
      await waitForExpect(() => expect(button.attributes().disabled).toBe('false'));
    });

    describe('on click', () => {
      beforeEach(async () => {
        const brand = wrapper.find('[data-testid="brand-input"]').findComponent({ name: 'ion-input' });
        const name = wrapper.find('[data-testid="name-input"]').findComponent({ name: 'ion-input' });
        const teaType = wrapper.find('[data-testid="tea-type-select"]').findComponent({ name: 'ion-select' });
        const rating = wrapper.find('[data-testid="rating-input"]').findComponent({ name: 'app-rating' });
        const notes = wrapper.find('[data-testid="notes-textbox"]').findComponent({ name: 'ion-textarea' });

        await brand.setValue('foobar');
        await name.setValue('mytea');
        await teaType.setValue(3);
        await rating.setValue(2);
        await notes.setValue('Meh. It is ok.');
      });

      it('merges the tasting note', async () => {
        const { merge } = useTastingNotes();
        const button = wrapper.find('[data-testid="submit-button"]');
        await button.trigger('click');

        expect(merge).toHaveBeenCalledTimes(1);
        expect(merge).toHaveBeenCalledWith({
          brand: 'foobar',
          name: 'mytea',
          rating: 2,
          teaCategoryId: 3,
          notes: 'Meh. It is ok.',
        });
      });

      it('includes the ID if it set', async () => {
        const { merge } = useTastingNotes();
        const button = wrapper.find('[data-testid="submit-button"]');
        await wrapper.setProps({ noteId: 4273 });
        await button.trigger('click');

        expect(merge).toHaveBeenCalledWith({
          id: 4273,
          brand: 'foobar',
          name: 'mytea',
          rating: 2,
          teaCategoryId: 3,
          notes: 'Meh. It is ok.',
        });
      });

      it('closes the modal', async () => {
        const button = wrapper.find('[data-testid="submit-button"]');
        expect(modalController.dismiss).not.toHaveBeenCalled();
        await button.trigger('click');
        expect(modalController.dismiss).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('cancel button', () => {
    it('does not merge', async () => {
      const { merge } = useTastingNotes();
      const button = wrapper.find('[data-testid="cancel-button"]');
      await button.trigger('click');
      expect(merge).not.toHaveBeenCalled();
    });

    it('closes the modal', async () => {
      const button = wrapper.find('[data-testid="cancel-button"]');

      expect(modalController.dismiss).not.toHaveBeenCalled();
      await button.trigger('click');
      expect(modalController.dismiss).toHaveBeenCalledTimes(1);
    });
  });
});